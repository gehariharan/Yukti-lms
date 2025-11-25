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
  },
  valuesInsights: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['completed', 'updateConcept'])

const learningStore = useLearningStore()
const mockCoach = new MockCoachService()
const geminiCoach = ref(null)

// Conversational state
const currentStep = ref(0)
const conversationHistory = ref([])
const isThinking = ref(false)
const responses = ref({})
const finalInsights = ref(props.savedData?.insights || null)

// Get teammate data from previous challenge
const teammates = computed(() => {
  if (!props.valuesInsights?.results) return []
  return props.valuesInsights.results.map(r => ({
    name: r.name,
    values: r.dominantFamily?.label || 'Unknown'
  }))
})

// Response strategies from framework
const responseStrategies = [
  {
    id: 'support',
    name: 'Support',
    description: 'Amplify what they already value',
    examples: ['Recognize their contributions', 'Create space for their strengths', 'Publicly acknowledge their wins']
  },
  {
    id: 'challenge',
    name: 'Challenge',
    description: 'Stretch them beyond comfort zone',
    examples: ['Assign stretch goals', 'Question assumptions', 'Push for alternate perspectives']
  },
  {
    id: 'connect',
    name: 'Connect',
    description: 'Link their values to team goals',
    examples: ['Show bigger picture', 'Highlight interdependencies', 'Build bridges to others']
  },
  {
    id: 'adapt',
    name: 'Adapt',
    description: 'Flex your approach to match their needs',
    examples: ['Change communication style', 'Adjust feedback frequency', 'Modify work environment']
  }
]

// Conversation steps
const conversationSteps = [
  {
    id: 'intro',
    type: 'coach_message',
    message: `Great work mapping your team's values! Now comes the most important part: **How do you respond to each person?**\n\nJust knowing someone values Achievement vs. Relationships isn't enough. You need to support AND challenge them in the right ways.\n\nLook at the Values Response Framework on the right. These four strategies will help you lead each person effectively.`,
    conceptUpdate: {
      title: 'Values Response Framework',
      description: 'Four ways to lead based on what people value: Support, Challenge, Connect, Adapt',
      asset: '/content/me-in-my-team/frameworks/response_starategies.png'
    }
  },
  {
    id: 'recall_teammates',
    type: 'coach_message',
    messageFunc: (teammates) => {
      if (teammates.length < 2) {
        return `Let's think about how to lead your team members effectively using the Values Response Framework.`
      }
      return `Remember your two teammates?\n\n**${teammates[0].name}** → ${teammates[0].values} orientation\n**${teammates[1].name}** → ${teammates[1].values} orientation\n\nLet's figure out how to support and challenge each of them.`
    },
    quickActions: [
      { id: 'show_framework', label: '🔍 Show response strategies' }
    ]
  },
  {
    id: 'person_a_support',
    type: 'multi_select_step',
    teammateIndex: 0,
    questionType: 'support',
    messageFunc: (name) => `Let's start with **${name}**.\n\nHow can you **support** what they already value? Pick 1-2 ways you'll amplify their strengths:`,
    options: responseStrategies[0].examples
  },
  {
    id: 'person_a_challenge',
    type: 'multi_select_step',
    teammateIndex: 0,
    questionType: 'challenge',
    messageFunc: (name) => `Now, how will you **challenge** ${name} to grow?\n\nSupport alone creates comfort. Challenge creates growth. Pick 1-2 ways you'll stretch ${name}:`,
    options: responseStrategies[1].examples
  },
  {
    id: 'person_a_reflection',
    type: 'coach_message',
    messageFunc: (name, supportItems, challengeItems) => {
      return `Excellent! So your leadership plan for **${name}** is:\n\n**Support**: ${supportItems.join(', ')}\n**Challenge**: ${challengeItems.join(', ')}\n\nThis balance prevents you from either coddling or over-stretching them. Let's do the same for your second teammate.`
    }
  },
  {
    id: 'person_b_support',
    type: 'multi_select_step',
    teammateIndex: 1,
    questionType: 'support',
    messageFunc: (name) => `Now for **${name}**.\n\nHow will you **support** their values? Pick 1-2 approaches:`,
    options: responseStrategies[0].examples
  },
  {
    id: 'person_b_challenge',
    type: 'multi_select_step',
    teammateIndex: 1,
    questionType: 'challenge',
    messageFunc: (name) => `And how will you **challenge** ${name}?`,
    options: responseStrategies[1].examples
  },
  {
    id: 'case_study_intro',
    type: 'coach_message',
    message: `Perfect! You've built a plan for both teammates.\n\nNow let's test your instincts with a quick scenario. I'll describe a common team situation, and you tell me which response strategy fits best.`,
    conceptUpdate: {
      highlight: 'case_study',
      description: 'Apply the framework to a real scenario'
    }
  },
  {
    id: 'case_study_question',
    type: 'single_select_step',
    message: `**Scenario**: One of your team members consistently delivers great work but never speaks up in meetings. They seem uncomfortable with visibility.\n\nWhich response strategy would you use first?`,
    options: responseStrategies.map(s => ({ id: s.id, label: s.name, description: s.description }))
  },
  {
    id: 'final_synthesis',
    type: 'coach_message',
    message: `Let me pull together everything you've learned in this track...`,
    triggerAnalysis: true
  }
]

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

// Initialize
if (!conversationHistory.value.length && !finalInsights.value) {
  showCurrentStep()
}

if (props.savedData?.conversationHistory) {
  conversationHistory.value = props.savedData.conversationHistory
  currentStep.value = props.savedData.currentStep || 0
}
if (props.savedData?.responses) {
  responses.value = props.savedData.responses
}

const currentStepData = computed(() => conversationSteps[currentStep.value] || null)

const progressPercentage = computed(() => {
  return Math.round((currentStep.value / conversationSteps.length) * 100)
})

async function showCurrentStep() {
  const step = conversationSteps[currentStep.value]
  if (!step) return

  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  let message = step.message
  if (step.messageFunc) {
    if (step.id === 'recall_teammates') {
      message = step.messageFunc(teammates.value)
    } else if (step.id === 'person_a_reflection') {
      const personA = teammates.value[0]
      const support = responses.value['person_a_support'] || []
      const challenge = responses.value['person_a_challenge'] || []
      message = step.messageFunc(personA?.name || 'Person A', support, challenge)
    } else if (step.teammateIndex !== undefined) {
      const person = teammates.value[step.teammateIndex]
      message = step.messageFunc(person?.name || `Person ${step.teammateIndex === 0 ? 'A' : 'B'}`)
    }
  }

  conversationHistory.value.push({
    type: 'coach',
    content: message,
    timestamp: Date.now(),
    quickActions: step.quickActions
  })

  if (step.conceptUpdate) {
    emit('updateConcept', step.conceptUpdate)
  }

  if (step.triggerAnalysis) {
    await performFinalAnalysis()
  }

  isThinking.value = false
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

function toggleSelection(key, item) {
  if (!responses.value[key]) {
    responses.value[key] = []
  }

  const exists = responses.value[key].includes(item)
  if (exists) {
    responses.value[key] = responses.value[key].filter(i => i !== item)
  } else {
    responses.value[key] = [...responses.value[key], item]
  }
}

function selectSingleOption(key, option) {
  responses.value[key] = option
}

async function handleNext() {
  const step = currentStepData.value

  if (step.type === 'multi_select_step') {
    const key = `person_${step.teammateIndex === 0 ? 'a' : 'b'}_${step.questionType}`
    const selections = responses.value[key] || []

    if (selections.length === 0) return

    conversationHistory.value.push({
      type: 'user_response',
      content: `Selected: ${selections.join(', ')}`,
      timestamp: Date.now()
    })
  } else if (step.type === 'single_select_step') {
    const selection = responses.value['case_study_response']
    if (!selection) return

    const strategy = responseStrategies.find(s => s.id === selection)
    conversationHistory.value.push({
      type: 'user_response',
      content: `**${strategy?.name}**: ${strategy?.description}`,
      timestamp: Date.now()
    })

    // Provide feedback
    isThinking.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))

    const feedback = selection === 'connect' || selection === 'support'
      ? `Good instinct! **${strategy?.name}** works well here. This person needs safety before visibility. ${strategy?.description.toLowerCase()} helps build their confidence first.`
      : `Interesting choice. **${strategy?.name}** could work, but consider whether they need confidence-building first. Support and Connect strategies might create a safer foundation.`

    conversationHistory.value.push({
      type: 'coach',
      content: feedback,
      timestamp: Date.now()
    })

    isThinking.value = false
  }

  currentStep.value += 1
  if (currentStep.value < conversationSteps.length) {
    await showCurrentStep()
  }

  scrollToBottom()
}

async function performFinalAnalysis() {
  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))

  const summary = `You've completed the **Me in My Team** track! Here's what you've learned:\n\n**1. Your Leadership Orientation**: You discovered whether you lead from Self-in or Others-in\n\n**2. Your Team's Values**: You mapped what drives ${teammates.value.map(t => t.name).join(' and ')}\n\n**3. Your Response Strategy**: You built a plan to support AND challenge each person\n\nThe real work starts now. Pick one action from your plans and try it this week. Notice what happens. Then come back and adjust.`

  finalInsights.value = {
    completed: true,
    timestamp: Date.now()
  }

  conversationHistory.value.push({
    type: 'coach',
    content: summary,
    timestamp: Date.now(),
    isResult: true
  })

  isThinking.value = false
  scrollToBottom()
}

function continueNext() {
  if (!finalInsights.value) return
  emit('completed', {
    responses: { ...responses.value },
    insights: finalInsights.value,
    conversationHistory: conversationHistory.value,
    currentStep: currentStep.value
  })
}

function handleQuickAction(action) {
  if (action === 'show_framework') {
    emit('updateConcept', {
      title: 'Values Response Framework',
      description: 'Four strategies: Support, Challenge, Connect, Adapt',
      asset: '/content/me-in-my-team/frameworks/response_starategies.png'
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

        <!-- User Response -->
        <div v-if="message.type === 'user_response'" class="flex justify-end mb-6">
          <div class="max-w-md rounded-2xl bg-yukti-saffron/10 border border-yukti-saffron/30 p-4">
            <p class="text-xs uppercase tracking-widest text-yukti-saffron mb-2">You</p>
            <div class="text-sm whitespace-pre-line" v-html="message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')" />
          </div>
        </div>
      </div>

      <!-- Multi-Select Step -->
      <div v-if="currentStepData?.type === 'multi_select_step' && !isThinking" class="space-y-4">
        <div class="rounded-xl border-2 border-border bg-card p-5">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in currentStepData.options"
              :key="option"
              type="button"
              class="px-4 py-2 rounded-lg text-sm border-2 transition-all hover:scale-105"
              :class="responses[`person_${currentStepData.teammateIndex === 0 ? 'a' : 'b'}_${currentStepData.questionType}`]?.includes(option)
                ? 'border-yukti-saffron bg-yukti-saffron text-white font-medium'
                : 'border-border bg-background text-foreground hover:border-yukti-saffron/50'"
              @click="toggleSelection(`person_${currentStepData.teammateIndex === 0 ? 'a' : 'b'}_${currentStepData.questionType}`, option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- Single Select Step -->
      <div v-if="currentStepData?.type === 'single_select_step' && !isThinking" class="space-y-3">
        <button
          v-for="option in currentStepData.options"
          :key="option.id"
          type="button"
          class="w-full rounded-xl border-2 p-4 text-left transition-all hover:scale-[1.02]"
          :class="responses['case_study_response'] === option.id
            ? 'border-yukti-saffron bg-yukti-saffron/10'
            : 'border-border bg-card hover:border-yukti-saffron/50'"
          @click="selectSingleOption('case_study_response', option.id)"
        >
          <p class="font-semibold text-foreground mb-1">{{ option.label }}</p>
          <p class="text-xs text-muted-foreground">{{ option.description }}</p>
        </button>
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
    </div>

    <!-- Action Bar -->
    <div class="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border px-6 py-4">
      <div class="flex justify-end gap-3">
        <Button
          v-if="!finalInsights && currentStepData?.type === 'multi_select_step'"
          :disabled="!(responses[`person_${currentStepData.teammateIndex === 0 ? 'a' : 'b'}_${currentStepData.questionType}`]?.length > 0)"
          @click="handleNext"
          class="px-8"
        >
          Continue
        </Button>
        <Button
          v-else-if="!finalInsights && currentStepData?.type === 'single_select_step'"
          :disabled="!responses['case_study_response']"
          @click="handleNext"
          class="px-8"
        >
          Submit Answer
        </Button>
        <Button
          v-else-if="!finalInsights && currentStepData?.type === 'coach_message'"
          @click="handleNext"
          class="px-8"
        >
          Got it
        </Button>
        <Button
          v-else-if="finalInsights"
          @click="continueNext"
          class="px-8 bg-gradient-to-r from-yukti-saffron to-orange-500 hover:from-yukti-saffron/90 hover:to-orange-500/90"
        >
          🎉 Complete Track
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
