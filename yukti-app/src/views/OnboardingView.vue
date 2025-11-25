<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learningStore'
import { GroqService } from '@/services/groq'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import AarohaAvatar from '@/components/learning/AarohaAvatar.vue'

const router = useRouter()
const learningStore = useLearningStore()
const groqClient = ref(null)

// Initialize Groq client when API key is available
watch(
  () => learningStore.groqApiKey,
  (key) => {
    if (learningStore.aiMode === 'groq' && key) {
      groqClient.value = new GroqService(key)
    } else {
      groqClient.value = null
    }
  },
  { immediate: true }
)

// Check if already onboarded
onMounted(() => {
  if (learningStore.isOnboarded) {
    // Show option to skip or redo
    showSkipOption.value = true
  }
})

const currentStep = ref(0)
const conversationHistory = ref([])
const isThinking = ref(false)
const showSkipOption = ref(false)
const showStartButton = ref(false)

const form = ref({
  name: '',
  role: '',
  industry: '',
  teamSize: '',
  focus: '',
  fullContext: ''
})

// Conversation steps
const conversationSteps = [
  {
    id: 'welcome',
    type: 'coach_message',
    message: `Hello! I'm **Aaroha**, your learning coach.\n\nI'll be guiding you through your leadership journey. Before we dive in, I'd love to know a bit about you—it helps me personalize every challenge to your real-world situation.\n\nJust two quick questions and we're done!`,
    delay: 800
  },
  {
    id: 'ask_name',
    type: 'input_step',
    inputKey: 'name',
    message: `First, what should I call you?`,
    placeholder: 'Your name',
    validation: (val) => val.length > 0
  },
  {
    id: 'greet_and_ask_context',
    type: 'coach_message',
    messageFunc: (name) => `Nice to meet you, **${name}**!\n\nNow, tell me about yourself in your own words. Feel free to share:\n\n• Your current role and what you do\n• The industry you're in\n• Your team size (if you lead one)\n• Any specific leadership challenges you're facing\n\nDon't worry about being formal—just give me the context that matters to you.`,
    delay: 600
  },
  {
    id: 'ask_full_context',
    type: 'input_step',
    inputKey: 'fullContext',
    message: null,
    placeholder: 'e.g., I\'m a Marketing Director at a healthcare startup with a team of 8. Struggling with delegation and keeping everyone aligned...',
    validation: (val) => val && val.length > 10,
    multiline: true
  },
  {
    id: 'final_summary',
    type: 'coach_message',
    messageFunc: (name, fullContext) => {
      return `Perfect, **${name}**! I have everything I need.\n\nI'll use this context throughout your learning journey to make every challenge relevant to your situation.\n\nLet's get started!`
    },
    delay: 1000,
    isComplete: true
  }
]

const currentStepData = computed(() => conversationSteps[currentStep.value] || null)
const progressPercentage = computed(() => {
  const inputSteps = conversationSteps.filter(s => s.type === 'input_step').length
  const completedInputs = conversationSteps
    .slice(0, currentStep.value)
    .filter(s => s.type === 'input_step').length
  return Math.round((completedInputs / inputSteps) * 100)
})

// Initialize conversation
if (!conversationHistory.value.length) {
  showCurrentStep()
}

async function showCurrentStep() {
  const step = conversationSteps[currentStep.value]
  if (!step) return

  isThinking.value = true
  await new Promise(resolve => setTimeout(resolve, step.delay || 800))

  let message = step.message

  // Use Groq AI if in groq mode and client is available
  if (learningStore.aiMode === 'groq' && groqClient.value && step.type === 'coach_message' && !step.isComplete) {
    try {
      message = await groqClient.value.generateOnboardingResponse({
        participantData: form.value,
        conversationHistory: conversationHistory.value
      })
    } catch (error) {
      console.error('Groq API error:', error)
      // Fallback to scripted message
      if (step.messageFunc) {
        message = step.messageFunc(
          form.value.name,
          form.value.fullContext
        )
      }
    }
  } else if (step.messageFunc) {
    message = step.messageFunc(
      form.value.name,
      form.value.fullContext
    )
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

  // If this is the completion step, show start button instead of auto-navigating
  if (step.isComplete) {
    showStartButton.value = true
    // Scroll again after button is rendered
    await nextTick()
    scrollToBottom()
    return
  }

  // If this is a coach_message, automatically advance to next step
  if (step.type === 'coach_message') {
    currentStep.value += 1
    if (currentStep.value < conversationSteps.length) {
      await showCurrentStep()
    }
  }
}

function scrollToBottom() {
  nextTick(() => {
    // Small delay to ensure DOM is fully updated
    setTimeout(() => {
      const container = document.querySelector('.conversation-container')
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 200)
  })
}

async function handleNext() {
  const step = currentStepData.value

  if (step.type === 'input_step') {
    const value = form.value[step.inputKey]

    // Validate
    if (step.validation && !step.validation(value)) return

    // Record user response
    conversationHistory.value.push({
      type: 'user_response',
      content: value,
      timestamp: Date.now()
    })

    // Scroll after user message
    await nextTick()
    scrollToBottom()
  }

  // Move to next step
  currentStep.value += 1
  if (currentStep.value < conversationSteps.length) {
    await showCurrentStep()
  }

  scrollToBottom()
}

function extractContextData(fullContext) {
  // Simple extraction logic - can be enhanced with AI later
  const context = fullContext.toLowerCase()

  // Extract role (common job titles)
  const rolePatterns = [
    /(?:i'm|i am|work as|role as|position as)\s+(?:a|an)?\s*([^,.\n]+?)(?:\s+(?:at|in|for|with)|,|\.|\n|$)/i,
    /^([^,.\n]+?)(?:\s+(?:at|in|for|with)|,|\.|\n)/i
  ]
  let role = ''
  for (const pattern of rolePatterns) {
    const match = fullContext.match(pattern)
    if (match && match[1]) {
      role = match[1].trim()
      break
    }
  }

  // Extract team size (numbers followed by team/people/members)
  const teamMatch = fullContext.match(/(?:team of|managing|leading)\s+(\d+)|(\d+)\s+(?:people|members|direct reports)/i)
  const teamSize = teamMatch ? (teamMatch[1] || teamMatch[2]) : ''

  // Extract industry (common industry keywords)
  const industries = ['healthcare', 'fintech', 'manufacturing', 'retail', 'technology', 'tech', 'education', 'finance', 'consulting', 'startup', 'saas', 'ecommerce']
  let industry = ''
  for (const ind of industries) {
    if (context.includes(ind)) {
      industry = ind.charAt(0).toUpperCase() + ind.slice(1)
      break
    }
  }

  return { role, industry, teamSize }
}

function completeOnboarding() {
  const extracted = extractContextData(form.value.fullContext)

  learningStore.setParticipant({
    name: form.value.name,
    role: extracted.role || 'Leader',
    industry: extracted.industry || 'General',
    teamSize: extracted.teamSize || 'Not specified',
    focus: form.value.fullContext,
    fullContext: form.value.fullContext
  })

  router.push('/tracks')
}

function skipOnboarding() {
  router.push('/tracks')
}

function redoOnboarding() {
  showSkipOption.value = false
  form.value = {
    name: '',
    role: '',
    industry: '',
    teamSize: '',
    focus: ''
  }
  conversationHistory.value = []
  currentStep.value = 0
  showCurrentStep()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
    <!-- Skip Option (if already onboarded) -->
    <div v-if="showSkipOption" class="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-card rounded-2xl border-2 border-yukti-saffron/30 p-8 shadow-2xl space-y-6">
        <div class="flex justify-center">
          <AarohaAvatar />
        </div>
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold text-foreground">Welcome back, {{ learningStore.participant.name }}!</h2>
          <p class="text-sm text-muted-foreground">
            I remember you from last time. Want to continue with your existing profile or start fresh?
          </p>
        </div>
        <div class="space-y-3">
          <Button @click="skipOnboarding" class="w-full">
            Continue with existing profile
          </Button>
          <Button @click="redoOnboarding" variant="outline" class="w-full">
            Start fresh onboarding
          </Button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="border-b border-border/60 bg-card/90 px-6 py-4">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Welcome to Yukti</p>
            <h1 class="text-xl font-semibold text-foreground">Let's get to know you</h1>
          </div>
          <div class="text-right">
            <p class="text-xs text-muted-foreground">Progress</p>
            <p class="text-lg font-semibold text-foreground">{{ progressPercentage }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Conversation Container -->
    <div class="flex-1 overflow-y-auto conversation-container pb-32">
      <div class="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div
          v-for="(message, index) in conversationHistory"
          :key="index"
          class="animate-fade-in"
        >
          <!-- Coach Message -->
          <div v-if="message.type === 'coach'" class="flex gap-3 mb-6">
            <AarohaAvatar />
            <div class="flex-1 rounded-2xl bg-gradient-to-br from-card to-muted/50 border border-border p-5 shadow-sm max-w-2xl">
              <p class="text-xs uppercase tracking-widest text-muted-foreground mb-2">Aaroha Coach</p>
              <div class="text-sm text-foreground leading-relaxed whitespace-pre-line" v-html="message.content.replace(/\*\*(.*?)\*\*/g, '<strong class=\'text-yukti-saffron\'>$1</strong>')" />
            </div>
          </div>

          <!-- User Response -->
          <div v-if="message.type === 'user_response'" class="flex justify-end mb-6">
            <div class="max-w-md rounded-2xl bg-yukti-saffron/10 border border-yukti-saffron/30 p-4">
              <p class="text-xs uppercase tracking-widest text-yukti-saffron mb-2">You</p>
              <div class="text-sm font-medium text-foreground">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <!-- Thinking Indicator -->
        <div v-if="isThinking" class="flex gap-3 animate-fade-in">
          <AarohaAvatar />
          <div class="rounded-2xl bg-card border border-border p-4">
            <div class="flex gap-2">
              <div class="w-2 h-2 rounded-full bg-yukti-saffron animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 rounded-full bg-yukti-saffron animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 rounded-full bg-yukti-saffron animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>

        <!-- Start Button (shown after onboarding completion) -->
        <div v-if="showStartButton" class="flex justify-center mt-8 mb-8 animate-fade-in">
          <Button @click="completeOnboarding" size="lg" class="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            Let's get started! →
          </Button>
        </div>
      </div>
    </div>

    <!-- Fixed Composer Input at Bottom -->
    <div v-if="currentStepData?.type === 'input_step' && !isThinking" class="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-40">
      <div class="max-w-4xl mx-auto px-6 py-5">
        <div class="flex items-end gap-3">
          <!-- Multiline textarea for fullContext, single line input for others -->
          <textarea
            v-if="currentStepData.multiline"
            v-model="form[currentStepData.inputKey]"
            :placeholder="currentStepData.placeholder || 'Type your response...'"
            class="flex-1 text-base px-4 py-3 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-yukti-saffron"
            rows="4"
            @keyup.ctrl.enter="handleNext"
            autofocus
          ></textarea>
          <Input
            v-else
            v-model="form[currentStepData.inputKey]"
            :placeholder="currentStepData.placeholder || 'Type your response...'"
            class="flex-1 text-base h-14"
            @keyup.enter="handleNext"
            autofocus
          />
          <Button
            @click="handleNext"
            :disabled="currentStepData.validation && !currentStepData.validation(form[currentStepData.inputKey])"
            class="flex-shrink-0 h-14 w-14"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m5 12 7-7 7 7"/>
              <path d="M12 19V5"/>
            </svg>
          </Button>
        </div>
        <p v-if="currentStepData.multiline" class="text-xs text-muted-foreground mt-2 text-center">
          Press Ctrl+Enter to submit
        </p>
      </div>
    </div>

    <!-- Progress Dots -->
    <div class="border-t border-border/60 bg-card/90 px-6 py-4">
      <div class="max-w-4xl mx-auto flex justify-center gap-2">
        <div
          v-for="(step, index) in conversationSteps.filter(s => s.type === 'input_step')"
          :key="index"
          :class="[
            'h-2 w-2 rounded-full transition-all duration-300',
            currentStep > conversationSteps.indexOf(step) ? 'bg-yukti-saffron w-8' : 'bg-muted'
          ]"
        />
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
