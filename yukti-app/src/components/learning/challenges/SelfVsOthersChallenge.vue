<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import AarohaAvatar from '@/components/learning/AarohaAvatar.vue'
import { useLearningStore } from '@/stores/learningStore'
import { GeminiService } from '@/services/gemini'
import { MockCoachService } from '@/services/mockCoach'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  savedData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['completed', 'updateConcept'])

const learningStore = useLearningStore()
const mockCoach = new MockCoachService()
const geminiCoach = ref(null)

// Conversational state
const currentStep = ref(0)
const responses = ref({})
const conversationHistory = ref([])
const isThinking = ref(false)
const insights = ref(props.savedData?.result || null)
const personalNotes = ref(props.savedData?.notes || '')

// Define conversation steps (select key pairs from full assessment)
const conversationSteps = [
  {
    id: 'intro',
    type: 'coach_message',
    message: `Hi ${learningStore.participant?.name || 'there'}! Let's explore your leadership orientation together. I'll ask you about a few scenarios, and we'll discover whether you naturally lead from a self-first or others-first perspective.\n\nTake a look at the framework I've shared on the right. This is what we'll be mapping you onto.`,
    conceptUpdate: {
      title: 'Self vs. Others in Leadership',
      description: 'A spectrum showing how leaders balance personal vision with team needs',
      highlight: 'overview'
    }
  },
  {
    id: 'power_and_purpose',
    type: 'paired_question',
    intro: 'Let\'s start with how you think about power and purpose in your role.',
    sectionId: 'power_and_purpose',
    prompts: [
      {
        id: 'self_platform',
        orientation: 'self_in',
        statement: 'I see leadership as a platform to make things happen using my judgment and ideas.'
      },
      {
        id: 'others_elevate',
        orientation: 'others_in',
        statement: 'I feel responsible for using my role to elevate others and serve the larger system.'
      }
    ],
    coachReflection: (selfScore, othersScore) => {
      if (selfScore > othersScore) {
        return `You lean toward using your position as a platform for your own vision—that's Self-in. There's strength in clarity and conviction. Let's see if this pattern continues.`
      } else if (othersScore > selfScore) {
        return `You're oriented toward elevating others—that's Others-in. This service mindset can be powerful. Let's explore further.`
      } else {
        return `Interesting—you're balanced here. You see leadership as both personal platform and service to others. Let's see what emerges in the next scenario.`
      }
    }
  },
  {
    id: 'focus_of_attention',
    type: 'paired_question',
    intro: 'Now let\'s look at where your attention naturally goes in team settings.',
    sectionId: 'focus_of_attention',
    prompts: [
      {
        id: 'self_align',
        orientation: 'self_in',
        statement: 'I often focus on aligning others to my vision or way of working.'
      },
      {
        id: 'others_value',
        orientation: 'others_in',
        statement: 'I invest time in understanding what others value and care about.'
      }
    ],
    coachReflection: (selfScore, othersScore) => {
      if (selfScore > othersScore) {
        return `You focus on alignment to your vision. This creates clarity but can miss what motivates your team. Notice the "Directive" zone on the framework—this is where you might sit.`
      } else if (othersScore > selfScore) {
        return `You invest in understanding others first. Look at the "Facilitative" zone on the right—this is your natural space. But are there times when your team needs more direction?`
      } else {
        return `You balance directing with understanding. That's adaptive leadership. The question is: can you flex between these modes intentionally?`
      }
    },
    conceptUpdate: {
      highlight: 'spectrum',
      description: 'Notice how directive (Self-in) and facilitative (Others-in) approaches sit on opposite ends'
    },
    quickActions: [
      { id: 'show_framework', label: '🔍 Show framework again' }
    ]
  },
  {
    id: 'relationship_orientation',
    type: 'paired_question',
    intro: 'One more: how do you see your role in relation to your team?',
    sectionId: 'relationship_orientation',
    prompts: [
      {
        id: 'self_decision_maker',
        orientation: 'self_in',
        statement: 'I see my role as a decision-maker who guides and directs.'
      },
      {
        id: 'others_collaborator',
        orientation: 'others_in',
        statement: 'I see my role as a collaborator who facilitates and learns with others.'
      }
    ],
    coachReflection: (selfScore, othersScore) => {
      if (selfScore > othersScore) {
        return `You see yourself as the decision-maker. That's classic Self-in orientation. In your ${learningStore.participant?.industry || 'industry'}, when does this serve you? When does it limit you?`
      } else {
        return `You see yourself as a collaborator. That's Others-in. In a ${learningStore.participant?.teamSize || 'team'} like yours, this can unlock collective wisdom—but are there moments when the team needs you to decide?`
      }
    },
    conceptUpdate: {
      highlight: 'balance_point',
      description: 'The most effective leaders can flex between these orientations based on context'
    }
  },
  {
    id: 'analysis',
    type: 'coach_message',
    message: 'Let me analyze your responses and show you where you sit on this spectrum...',
    triggerAnalysis: true
  }
]

const scale = computed(() => props.config?.scale || { min: 1, max: 5 })
const interpretationBands = computed(() => props.config?.scoring?.insightBands || [])

watch(
  () => learningStore.aiApiKey,
  (key) => {
    if (learningStore.aiMode === 'gemini' && key) {
      geminiCoach.value = new GeminiService(key)
    } else {
      geminiCoach.value = null
    }
  },
  { immediate: true }
)

const coachClient = computed(() => {
  if (learningStore.aiMode === 'gemini' && geminiCoach.value) {
    return geminiCoach.value
  }
  return mockCoach
})

// Initialize conversation
if (!conversationHistory.value.length && !insights.value) {
  showCurrentStep()
}

// Restore saved state
if (props.savedData?.responses) {
  responses.value = { ...props.savedData.responses }
}
if (props.savedData?.conversationHistory) {
  conversationHistory.value = props.savedData.conversationHistory
  currentStep.value = props.savedData.currentStep || conversationHistory.value.length
}

const currentStepData = computed(() => conversationSteps[currentStep.value] || null)
const canProgress = computed(() => {
  const step = currentStepData.value
  if (!step) return false
  if (step.type === 'coach_message') return true
  if (step.type === 'paired_question') {
    return step.prompts.every(p => responses.value[p.id] !== undefined)
  }
  return false
})

const progressPercentage = computed(() => {
  const questionSteps = conversationSteps.filter(s => s.type === 'paired_question').length
  const answeredSteps = conversationSteps
    .slice(0, currentStep.value)
    .filter(s => s.type === 'paired_question').length
  return Math.round((answeredSteps / questionSteps) * 100)
})

async function showCurrentStep() {
  const step = conversationSteps[currentStep.value]
  if (!step) return

  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, 800)) // Simulate thinking

  if (step.type === 'coach_message') {
    conversationHistory.value.push({
      type: 'coach',
      content: step.message,
      timestamp: Date.now()
    })

    // Update concept panel if specified
    if (step.conceptUpdate) {
      emit('updateConcept', step.conceptUpdate)
    }

    // Trigger analysis if needed
    if (step.triggerAnalysis) {
      await performAnalysis()
    }
  } else if (step.type === 'paired_question') {
    conversationHistory.value.push({
      type: 'coach',
      content: step.intro,
      timestamp: Date.now()
    })

    if (step.conceptUpdate) {
      emit('updateConcept', step.conceptUpdate)
    }
  }

  isThinking.value = false
  scrollToBottom()
}

function selectResponse(promptId, value) {
  responses.value = {
    ...responses.value,
    [promptId]: value
  }
}

async function handleNext() {
  const step = currentStepData.value

  if (step.type === 'paired_question') {
    // Record user responses
    conversationHistory.value.push({
      type: 'user_response',
      stepId: step.id,
      responses: step.prompts.map(p => ({
        promptId: p.id,
        statement: p.statement,
        value: responses.value[p.id]
      })),
      timestamp: Date.now()
    })

    // Generate coach reflection
    isThinking.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))

    const selfScore = responses.value[step.prompts.find(p => p.orientation === 'self_in')?.id] || 0
    const othersScore = responses.value[step.prompts.find(p => p.orientation === 'others_in')?.id] || 0
    const reflection = step.coachReflection(selfScore, othersScore)

    conversationHistory.value.push({
      type: 'coach',
      content: reflection,
      timestamp: Date.now()
    })

    isThinking.value = false
  }

  // Move to next step
  currentStep.value += 1
  if (currentStep.value < conversationSteps.length) {
    await showCurrentStep()
  }

  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    const container = document.querySelector('.conversation-container')
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

function computeCounts() {
  const counts = { self: 0, others: 0 }

  conversationSteps
    .filter(s => s.type === 'paired_question')
    .forEach(step => {
      const selfPrompt = step.prompts.find(p => p.orientation === 'self_in')
      const othersPrompt = step.prompts.find(p => p.orientation === 'others_in')

      const selfScore = responses.value[selfPrompt?.id] || 0
      const othersScore = responses.value[othersPrompt?.id] || 0

      if (selfScore > othersScore) counts.self += 1
      else if (othersScore > selfScore) counts.others += 1
    })

  return counts
}

function deriveInterpretation(counts) {
  const band = interpretationBands.value.find(candidate => {
    const { range = {} } = candidate
    const minSelf = range.minSelfWins ?? Number.NEGATIVE_INFINITY
    const maxSelf = range.maxSelfWins ?? Number.POSITIVE_INFINITY
    const minOthers = range.minOthersWins ?? Number.NEGATIVE_INFINITY
    const maxOthers = range.maxOthersWins ?? Number.POSITIVE_INFINITY

    const matchesSelf = counts.self >= minSelf && counts.self <= maxSelf
    const matchesOthers = counts.others >= minOthers && counts.others <= maxOthers

    return matchesSelf && matchesOthers
  })

  return band || {
    label: 'Balanced',
    summary: 'You integrate both orientations dynamically.'
  }
}

async function performAnalysis() {
  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))

  const counts = computeCounts()
  const interpretation = deriveInterpretation(counts)

  insights.value = { counts, interpretation }

  // Generate AI coach feedback
  try {
    const aiResponse = await coachClient.value.summarizeSelfReflection({
      participant: learningStore.participant,
      result: { counts, interpretation }
    })

    conversationHistory.value.push({
      type: 'coach',
      content: `Based on your responses, you're **${interpretation.label}**.\n\n${interpretation.summary}\n\n${aiResponse.summary}`,
      timestamp: Date.now(),
      isResult: true
    })

    if (aiResponse.actionItems?.length) {
      conversationHistory.value.push({
        type: 'coach',
        content: `Here's what I recommend:\n${aiResponse.actionItems.map(item => `• ${item}`).join('\n')}`,
        timestamp: Date.now()
      })
    }
  } catch (error) {
    conversationHistory.value.push({
      type: 'coach',
      content: `You're **${interpretation.label}**. ${interpretation.summary}`,
      timestamp: Date.now(),
      isResult: true
    })
  }

  isThinking.value = false
  scrollToBottom()

  // Update concept panel to show result
  emit('updateConcept', {
    title: interpretation.label,
    description: 'Your leadership orientation',
    highlight: 'result'
  })
}

function continueNext() {
  if (!insights.value) return
  emit('completed', {
    responses: { ...responses.value },
    result: insights.value,
    notes: personalNotes.value,
    conversationHistory: conversationHistory.value,
    currentStep: currentStep.value
  })
}

function handleQuickAction(action) {
  if (action === 'show_framework') {
    emit('updateConcept', {
      title: 'Self vs. Others in Leadership',
      description: 'A spectrum showing how leaders balance personal vision with team needs',
      asset: '/content/me-in-my-team/frameworks/self_vs_others.png'
    })
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Progress Bar -->
    <div class="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
      <div class="flex items-center justify-between text-sm mb-2">
        <span class="text-muted-foreground">Progress</span>
        <span class="font-semibold text-foreground">{{ progressPercentage }}%</span>
      </div>
      <div class="w-full bg-muted rounded-full h-2">
        <div
          class="bg-yukti-saffron h-2 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>

    <!-- Conversation Container -->
    <div class="flex-1 overflow-y-auto conversation-container px-6 py-6 space-y-6">
      <div
        v-for="(message, index) in conversationHistory"
        :key="index"
        class="animate-fade-in"
      >
        <!-- Coach Message -->
        <div v-if="message.type === 'coach'" class="flex gap-3 mb-6">
          <AarohaAvatar />
          <div
            class="flex-1 rounded-2xl bg-gradient-to-br from-card to-muted/50 border border-border p-5 shadow-sm"
            :class="{ 'border-yukti-saffron/50 bg-yukti-saffron/5': message.isResult }"
          >
            <p class="text-xs uppercase tracking-widest text-muted-foreground mb-2">Aaroha Coach</p>
            <div class="text-sm text-foreground leading-relaxed whitespace-pre-line" v-html="message.content.replace(/\*\*(.*?)\*\*/g, '<strong class=\'text-yukti-saffron\'>$1</strong>')" />

            <!-- Quick Actions -->
            <div v-if="message.quickActions" class="flex gap-2 mt-4">
              <button
                v-for="action in message.quickActions"
                :key="action.id"
                class="text-xs px-3 py-1 rounded-full border border-yukti-saffron/30 bg-yukti-saffron/5 text-yukti-saffron hover:bg-yukti-saffron/10 transition-colors"
                @click="handleQuickAction(action.id)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- User Response Summary -->
        <div v-if="message.type === 'user_response'" class="flex justify-end mb-6">
          <div class="max-w-md rounded-2xl bg-yukti-saffron/10 border border-yukti-saffron/30 p-4">
            <p class="text-xs uppercase tracking-widest text-yukti-saffron mb-2">Your Response</p>
            <div class="space-y-2">
              <div v-for="resp in message.responses" :key="resp.promptId" class="text-xs">
                <p class="text-muted-foreground">{{ resp.statement }}</p>
                <p class="font-semibold text-foreground">Rating: {{ resp.value }}/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Question (if on question step) -->
      <div v-if="currentStepData?.type === 'paired_question' && !isThinking" class="space-y-6">
        <div
          v-for="prompt in currentStepData.prompts"
          :key="prompt.id"
          class="rounded-xl border-2 border-border bg-card p-6 space-y-4"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-yukti-saffron/10 text-yukti-saffron flex items-center justify-center text-xs font-bold">
              {{ prompt.orientation === 'self_in' ? 'A' : 'B' }}
            </div>
            <p class="flex-1 font-medium text-foreground leading-relaxed">{{ prompt.statement }}</p>
          </div>

          <!-- Scale -->
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-muted-foreground">{{ scale.labels?.['1'] || 'Strongly Disagree' }}</span>
              <div class="flex gap-2">
                <button
                  v-for="value in scale.max"
                  :key="`${prompt.id}-${value}`"
                  type="button"
                  class="w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yukti-saffron focus:ring-offset-1"
                  :class="responses[prompt.id] === value
                    ? 'border-yukti-saffron bg-yukti-saffron text-white shadow-md'
                    : 'border-border bg-background hover:border-yukti-saffron/50'"
                  @click="selectResponse(prompt.id, value)"
                >
                  {{ value }}
                </button>
              </div>
              <span class="text-xs text-muted-foreground">{{ scale.labels?.['5'] || 'Strongly Agree' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Thinking Indicator -->
      <div v-if="isThinking" class="flex gap-3">
        <AarohaAvatar />
        <div class="rounded-2xl bg-card border border-border p-4">
          <div class="flex gap-2">
            <div class="w-2 h-2 rounded-full bg-yukti-saffron animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 rounded-full bg-yukti-saffron animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 rounded-full bg-yukti-saffron animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>

      <!-- Notes Section (after analysis) -->
      <div v-if="insights" class="space-y-4 pt-6 border-t border-border">
        <div class="space-y-2">
          <label class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Reflections
          </label>
          <textarea
            v-model="personalNotes"
            class="w-full border-2 border-border rounded-xl p-4 bg-background resize-none focus:border-yukti-saffron focus:outline-none transition-colors"
            rows="4"
            placeholder="What resonated with you? Where do you see this playing out in your team?"
          />
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border px-6 py-4">
      <div class="flex justify-end gap-3">
        <Button
          v-if="!insights && currentStepData?.type === 'paired_question'"
          :disabled="!canProgress"
          @click="handleNext"
          class="px-8"
        >
          Continue
        </Button>
        <Button
          v-else-if="!insights && currentStepData?.type === 'coach_message'"
          @click="handleNext"
          class="px-8"
        >
          Got it
        </Button>
        <Button
          v-else-if="insights"
          @click="continueNext"
          class="px-8"
        >
          Continue to Next Challenge
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>
