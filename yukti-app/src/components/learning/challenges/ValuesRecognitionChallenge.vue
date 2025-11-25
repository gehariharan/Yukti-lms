<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
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
const teammates = ref([
  { key: 'person_a', name: '', selections: {} },
  { key: 'person_b', name: '', selections: {} }
])
const conversationHistory = ref([])
const isThinking = ref(false)
const results = ref(props.savedData?.results || null)
const currentFocus = ref(null) // Which teammate we're currently analyzing

// Conversation steps
const conversationSteps = [
  {
    id: 'intro',
    type: 'coach_message',
    message: `Now let's talk about values—the invisible forces that drive how people show up at work.\n\nI'd like you to think about two people on your team. We'll explore what each person values most, and I'll show you how to spot these values in everyday behavior.\n\nLook at the Values Recognition Grid on the right. This framework will help us decode what matters to each person.`,
    conceptUpdate: {
      title: 'Values Recognition Grid',
      description: 'Four value families that drive behavior: Achievement, Relationships, Order, and Growth',
      asset: '/content/me-in-my-team/frameworks/values_recognition.png'
    }
  },
  {
    id: 'name_teammates',
    type: 'input_step',
    message: `Let's start simple. Who are the two team members you'd like to understand better?\n\nJust give me their names (or initials if you prefer to keep it anonymous).`,
    inputType: 'teammate_names'
  },
  {
    id: 'explain_person_a',
    type: 'coach_message',
    messageFunc: (name) => `Great! Let's focus on **${name}** first.\n\nI'm going to show you some behavioral signals. Pick the ones you see in ${name}. Don't overthink it—go with your gut.`,
    conceptUpdate: {
      highlight: 'achievement_relationships',
      description: 'Notice signals of Achievement (driving results) vs. Relationships (building connections)'
    }
  },
  {
    id: 'analyze_person_a',
    type: 'selection_step',
    teammateIndex: 0,
    familyGroups: ['achievement', 'oneness'],
    messageFunc: (name) => `Pick 2-3 signals you see in **${name}**:`
  },
  {
    id: 'person_a_reflection',
    type: 'coach_message',
    messageFunc: (name, dominantFamily) => {
      const insights = {
        achievement: `${name} is driven by **Achievement**. They're energized by results, goals, and making impact. You'll see this in how they push for outcomes and measure progress.`,
        oneness: `${name} values **Connection & Unity** highly. They frame decisions around collective impact and emphasize shared vision. Notice how they encourage collaboration and build trust.`,
        stability: `${name} leans toward **Stability & Order**. They appreciate structure, clarity, and predictability. This shows up in their preference for process and consistency.`,
        ambition: `${name} is oriented toward **Ambition & Growth**. They pursue stretch targets, engage in continuous learning, and inspire others with vision. Watch how they embrace development.`
      }
      return insights[dominantFamily] || `Interesting pattern emerging for ${name}...`
    }
  },
  {
    id: 'explain_person_b',
    type: 'coach_message',
    messageFunc: (name) => `Now let's look at **${name}**.\n\nSame process—I'll show you signals, you tell me what you observe.`,
    conceptUpdate: {
      highlight: 'order_growth',
      description: 'Now exploring Order (seeking stability) vs. Growth (embracing change)'
    }
  },
  {
    id: 'analyze_person_b',
    type: 'selection_step',
    teammateIndex: 1,
    familyGroups: ['stability', 'ambition'],
    messageFunc: (name) => `What do you see in **${name}**?`
  },
  {
    id: 'final_analysis',
    type: 'coach_message',
    message: `Let me map both team members onto the Values Grid...`,
    triggerAnalysis: true
  }
]

const families = computed(() => props.config?.valueFamilies || [])

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
if (!conversationHistory.value.length && !results.value) {
  showCurrentStep()
}

if (props.savedData?.teammates) {
  teammates.value = props.savedData.teammates
}
if (props.savedData?.conversationHistory) {
  conversationHistory.value = props.savedData.conversationHistory
  currentStep.value = props.savedData.currentStep || 0
}

const currentStepData = computed(() => conversationSteps[currentStep.value] || null)

const progressPercentage = computed(() => {
  return Math.round((currentStep.value / conversationSteps.length) * 100)
})

async function showCurrentStep() {
  const step = conversationSteps[currentStep.value]
  if (!step) {
    console.log('DEBUG: No step found at index', currentStep.value)
    return
  }

  console.log('DEBUG: Showing step', currentStep.value, step.id, step.type)

  // For selection steps, show message if messageFunc exists, but don't auto-advance
  if (step.type === 'selection_step' && step.messageFunc) {
    isThinking.value = true
    await new Promise(resolve => setTimeout(resolve, 800))

    let message
    try {
      if (step.id.includes('person_a') || step.id.includes('person_b')) {
        // Determine which teammate based on step id
        const index = step.id.includes('person_a') ? 0 : 1
        const name = teammates.value[index]?.name || 'this person'
        console.log('DEBUG: Selection step - index', index, 'name', name)
        message = step.messageFunc(name)
      } else {
        message = step.messageFunc(teammates.value)
      }
    } catch (error) {
      console.error('DEBUG: Error in selection step messageFunc', error)
      message = `Let's continue with the analysis...`
    }

    if (message) {
      conversationHistory.value.push({
        type: 'coach',
        content: message,
        timestamp: Date.now()
      })
    }

    isThinking.value = false
    scrollToBottom()
    return // Don't auto-advance selection steps
  }

  // Handle coach messages
  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  let message = step.message
  if (step.messageFunc) {
    try {
      if (step.id === 'person_a_reflection') {
        const person = teammates.value[0]
        const dominant = calculateDominantFamily(person)
        message = step.messageFunc(person.name, dominant?.id || null)
      } else if (step.id.includes('person_a') || step.id.includes('person_b')) {
        // Determine which teammate based on step id
        const index = step.id.includes('person_a') ? 0 : 1
        const name = teammates.value[index]?.name || 'this person'
        console.log('DEBUG: Coach message - index', index, 'name', name, 'step.id', step.id)
        message = step.messageFunc(name)
      } else {
        message = step.messageFunc(teammates.value)
      }
    } catch (error) {
      console.error('DEBUG: Error in coach messageFunc', error)
      message = step.message || 'Let\'s continue...'
    }
  }

  if (message) {
    conversationHistory.value.push({
      type: 'coach',
      content: message,
      timestamp: Date.now(),
      quickActions: step.quickActions
    })
  }

  if (step.conceptUpdate) {
    emit('updateConcept', step.conceptUpdate)
  }

  if (step.triggerAnalysis) {
    await performAnalysis()
  }

  isThinking.value = false
  scrollToBottom()

  // Auto-advance coach messages (except those that trigger analysis)
  if (step.type === 'coach_message' && !step.triggerAnalysis) {
    console.log('DEBUG: Auto-advancing from', step.id, 'to step', currentStep.value + 1)
    currentStep.value += 1
    if (currentStep.value < conversationSteps.length) {
      await showCurrentStep()
    } else {
      console.log('DEBUG: Reached end of steps')
    }
  }
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

async function handleNext() {
  const step = currentStepData.value

  if (step.type === 'input_step' && step.inputType === 'teammate_names') {
    if (!teammates.value[0].name || !teammates.value[1].name) return

    console.log('DEBUG: Names captured:', teammates.value[0].name, teammates.value[1].name)

    conversationHistory.value.push({
      type: 'user_response',
      content: `**Person A**: ${teammates.value[0].name}\n**Person B**: ${teammates.value[1].name}`,
      timestamp: Date.now()
    })
  }

  currentStep.value += 1
  console.log('DEBUG: Moving to step', currentStep.value, conversationSteps[currentStep.value]?.id)
  if (currentStep.value < conversationSteps.length) {
    await showCurrentStep()
  }

  scrollToBottom()
}

function toggleSelection(teammateIndex, familyId, signal) {
  const person = teammates.value[teammateIndex]
  if (!person.selections[familyId]) {
    person.selections[familyId] = []
  }

  const exists = person.selections[familyId].includes(signal)
  if (exists) {
    person.selections[familyId] = person.selections[familyId].filter(s => s !== signal)
  } else {
    person.selections[familyId] = [...person.selections[familyId], signal]
  }
}

function hasSelections(teammateIndex) {
  const person = teammates.value[teammateIndex]
  return Object.values(person.selections).some(arr => arr.length > 0)
}

function calculateDominantFamily(person) {
  // Selections are stored by value ID (e.g., 'achievement', 'oneness')
  // We need to find which value has the most selections and return its full object
  let maxScore = 0
  let dominantValue = null

  for (const family of families.value) {
    for (const value of (family.values || [])) {
      const score = person.selections[value.id]?.length || 0
      if (score > maxScore) {
        maxScore = score
        dominantValue = value // Store the full value object
      }
    }
  }

  return dominantValue
}

async function handleSelectionNext() {
  const step = currentStepData.value
  const person = teammates.value[step.teammateIndex]

  if (!hasSelections(step.teammateIndex)) return

  // Record selections
  const selectedSignals = Object.entries(person.selections)
    .filter(([_, signals]) => signals.length > 0)
    .map(([familyId, signals]) => `${familyId}: ${signals.join(', ')}`)

  conversationHistory.value.push({
    type: 'user_response',
    content: `Selected signals for **${person.name}**:\n${selectedSignals.join('\n')}`,
    timestamp: Date.now()
  })

  currentStep.value += 1
  if (currentStep.value < conversationSteps.length) {
    await showCurrentStep()
  }

  scrollToBottom()
}

async function performAnalysis() {
  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))

  const analysisResults = teammates.value.map(person => {
    const dominant = calculateDominantFamily(person)
    return {
      name: person.name,
      dominantFamily: dominant,
      selections: person.selections
    }
  })

  results.value = analysisResults

  try {
    const aiResponse = await coachClient.value.summarizeValuesRecognition({
      participant: learningStore.participant,
      results: analysisResults
    })

    const person1Label = analysisResults[0].dominantFamily?.label || 'Mixed'
    const person2Label = analysisResults[1].dominantFamily?.label || 'Mixed'

    conversationHistory.value.push({
      type: 'coach',
      content: `Here's what I see:\n\n**${analysisResults[0].name}**: ${person1Label} orientation\n**${analysisResults[1].name}**: ${person2Label} orientation\n\n${aiResponse.summary}`,
      timestamp: Date.now(),
      isResult: true
    })

    if (aiResponse.actionItems?.length) {
      conversationHistory.value.push({
        type: 'coach',
        content: `Key insights:\n${aiResponse.actionItems.map(item => `• ${item}`).join('\n')}`,
        timestamp: Date.now()
      })
    }
  } catch (error) {
    const person1Label = analysisResults[0].dominantFamily?.label || 'Mixed'
    const person2Label = analysisResults[1].dominantFamily?.label || 'Mixed'
    
    conversationHistory.value.push({
      type: 'coach',
      content: `**${analysisResults[0].name}** → ${person1Label}\n**${analysisResults[1].name}** → ${person2Label}`,
      timestamp: Date.now(),
      isResult: true
    })
  }

  isThinking.value = false
  scrollToBottom()

  emit('updateConcept', {
    title: 'Your Team\'s Values Map',
    description: 'Understanding what drives each person helps you lead more effectively'
  })
}

function continueNext() {
  if (!results.value) return
  emit('completed', {
    teammates: teammates.value,
    results: results.value,
    conversationHistory: conversationHistory.value,
    currentStep: currentStep.value
  })
}

function handleQuickAction(action) {
  if (action === 'show_framework') {
    emit('updateConcept', {
      title: 'Values Recognition Grid',
      description: 'Four value families that drive behavior',
      asset: '/content/me-in-my-team/frameworks/values_recognition.png'
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

      <!-- Current Input Step -->
      <div v-if="currentStepData?.type === 'input_step' && !isThinking" class="space-y-4">
        <div v-if="currentStepData.inputType === 'teammate_names'" class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border-2 border-border bg-card p-5 space-y-3">
            <label class="text-sm font-semibold text-foreground">Person A</label>
            <Input
              v-model="teammates[0].name"
              placeholder="e.g., Priya, John, or just 'P'"
              class="text-base"
            />
          </div>
          <div class="rounded-xl border-2 border-border bg-card p-5 space-y-3">
            <label class="text-sm font-semibold text-foreground">Person B</label>
            <Input
              v-model="teammates[1].name"
              placeholder="e.g., Rahul, Sarah, or just 'R'"
              class="text-base"
            />
          </div>
        </div>
      </div>

      <!-- Current Selection Step -->
      <div v-if="currentStepData?.type === 'selection_step' && !isThinking" class="space-y-4">
        <template
          v-for="valueId in currentStepData.familyGroups"
          :key="valueId"
        >
          <div
            v-for="family in families"
            :key="`${family.id}-${valueId}`"
          >
            <div
              v-for="value in (family.values || []).filter(v => v.id === valueId)"
              :key="value.id"
              class="rounded-xl border-2 border-border bg-card p-5 space-y-4 mb-4"
            >
              <div>
                <h4 class="text-base font-semibold text-foreground mb-1">{{ value.label || value.id }}</h4>
                <p class="text-xs text-muted-foreground mb-3">{{ family.description || value.description }}</p>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="signal in (value.signals || [])"
                    :key="signal"
                    type="button"
                    class="px-3 py-1.5 rounded-full text-xs border-2 transition-all hover:scale-105 text-left"
                    :class="teammates[currentStepData.teammateIndex].selections[valueId]?.includes(signal)
                      ? 'border-yukti-saffron bg-yukti-saffron text-white font-medium'
                      : 'border-border bg-background text-foreground hover:border-yukti-saffron/50'"
                    @click="toggleSelection(currentStepData.teammateIndex, valueId, signal)"
                  >
                    {{ signal }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
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
          v-if="!results && currentStepData?.type === 'input_step'"
          :disabled="!teammates[0].name || !teammates[1].name"
          @click="handleNext"
          class="px-8"
        >
          Continue
        </Button>
        <Button
          v-else-if="!results && currentStepData?.type === 'selection_step'"
          :disabled="!hasSelections(currentStepData.teammateIndex)"
          @click="handleSelectionNext"
          class="px-8"
        >
          Continue
        </Button>
        <Button
          v-else-if="!results && currentStepData?.type === 'coach_message'"
          @click="handleNext"
          class="px-8"
        >
          Got it
        </Button>
        <Button
          v-else-if="results"
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
