<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learningStore'
import { GroqService } from '@/services/groq'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import AarohaAvatar from '@/components/learning/AarohaAvatar.vue'
import { ArrowLeft, X } from 'lucide-vue-next'

const router = useRouter()
const learningStore = useLearningStore()
const groqClient = ref(null)

const conversationHistory = ref([])
const currentMessage = ref('')
const isThinking = ref(false)
const conversationContainer = ref(null)

// Initialize Groq client when API key or mode changes
watch(
  () => [learningStore.groqApiKey, learningStore.aiMode],
  ([key, mode]) => {
    if (mode === 'groq' && key) {
      try {
        groqClient.value = new GroqService(key)
        console.log('GroqService initialized successfully')
      } catch (error) {
        console.error('Failed to initialize GroqService:', error)
        groqClient.value = null
      }
    } else {
      groqClient.value = null
    }
  },
  { immediate: true }
)

// Initialize with welcome message
if (!conversationHistory.value.length) {
  conversationHistory.value.push({
    type: 'coach',
    content: `Hi **${learningStore.participant.name}**! 👋\n\nI'm Aaroha, your leadership coach. I'm here to support you on your learning journey.\n\nWhat's on your mind today? You can ask me about:\n- Choosing the right track for your goals\n- Guidance on a specific work situation\n- Reflecting on your leadership challenges\n- Or anything else you'd like to explore`,
    timestamp: Date.now()
  })
}

function scrollToBottom() {
  nextTick(() => {
    setTimeout(() => {
      if (conversationContainer.value) {
        conversationContainer.value.scrollTo({
          top: conversationContainer.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 150)
  })
}

// Watch for new messages and auto-scroll
watch(
  () => conversationHistory.value.length,
  () => {
    scrollToBottom()
  }
)

// Watch for thinking state changes
watch(
  () => isThinking.value,
  (thinking) => {
    if (!thinking) {
      // Scroll after thinking stops (response added)
      scrollToBottom()
    }
  }
)

// Scroll to bottom on mount
onMounted(() => {
  scrollToBottom()
})

async function sendMessage() {
  if (!currentMessage.value.trim()) return

  const userMessage = currentMessage.value.trim()
  currentMessage.value = ''

  // Add user message
  conversationHistory.value.push({
    type: 'user',
    content: userMessage,
    timestamp: Date.now()
  })

  scrollToBottom()

  // Generate response
  isThinking.value = true

  try {
    let response

    if (learningStore.aiMode === 'groq' && groqClient.value) {
      // Use Groq AI - no artificial delay needed as Groq is fast
      response = await groqClient.value.generateCoachingResponse({
        participantData: learningStore.participant,
        conversationHistory: conversationHistory.value,
        userMessage
      })
    } else {
      // Demo mode - simple contextual responses
      response = generateDemoResponse(userMessage)
      // Small delay for demo mode to feel natural
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    conversationHistory.value.push({
      type: 'coach',
      content: response,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error generating response:', error)
    conversationHistory.value.push({
      type: 'coach',
      content: "I apologize, but I'm having trouble connecting right now. Let me try to help with what I can...",
      timestamp: Date.now()
    })
  } finally {
    isThinking.value = false
    scrollToBottom()
  }
}

function generateDemoResponse(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('track') || lowerMessage.includes('choose')) {
    return `Great question! Based on your role as **${learningStore.participant.role}**, I'd recommend starting with "Me in My Team" - it helps you understand how you show up as a leader.\n\nWhat specific challenges are you facing with your team right now?`
  }

  if (lowerMessage.includes('challenge') || lowerMessage.includes('situation') || lowerMessage.includes('problem')) {
    return `I'm here to help you work through that. Tell me more about the situation:\n\n- What's the context?\n- Who's involved?\n- What's making this challenging for you?`
  }

  if (lowerMessage.includes('team') || lowerMessage.includes('people')) {
    return `Team dynamics are at the heart of leadership. In **${learningStore.participant.industry}**, I imagine there are unique challenges.\n\nWhat's the most pressing team issue you're navigating right now?`
  }

  return `That's an interesting point. Let me reflect on what you're sharing...\n\nAs a **${learningStore.participant.role}**, how do you see this playing out in your day-to-day work?`
}

function handleQuickAction(action) {
  currentMessage.value = action
  sendMessage()
}

function goBack() {
  router.push('/tracks')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
    <!-- Header -->
    <div class="border-b border-border/60 bg-card/90 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="goBack"
              class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft :size="18" />
              <span>Back to Tracks</span>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <AarohaAvatar />
            <div>
              <h1 class="text-base font-semibold text-foreground">Aaroha Coach</h1>
              <p class="text-xs text-muted-foreground">Here to support your journey</p>
            </div>
          </div>
          <button
            @click="goBack"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X :size="20" />
          </button>
        </div>
      </div>
    </div>

    <!-- Conversation Container -->
    <div ref="conversationContainer" class="flex-1 overflow-y-auto conversation-container pb-32">
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

          <!-- User Message -->
          <div v-if="message.type === 'user'" class="flex justify-end mb-6">
            <div class="max-w-2xl rounded-2xl bg-yukti-saffron/10 border border-yukti-saffron/30 p-4">
              <p class="text-xs uppercase tracking-widest text-yukti-saffron mb-2">You</p>
              <div class="text-sm font-medium text-foreground whitespace-pre-line">{{ message.content }}</div>
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
      </div>
    </div>

    <!-- Fixed Composer Input at Bottom -->
    <div class="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-40">
      <div class="max-w-4xl mx-auto px-6 py-5">
        <div class="flex items-end gap-3">
          <Input
            v-model="currentMessage"
            placeholder="Share what's on your mind..."
            class="flex-1 text-base h-14"
            @keyup.enter="sendMessage"
            :disabled="isThinking"
            autofocus
          />
          <Button
            @click="sendMessage"
            :disabled="!currentMessage.trim() || isThinking"
            class="flex-shrink-0 h-14 w-14"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m5 12 7-7 7 7"/>
              <path d="M12 19V5"/>
            </svg>
          </Button>
        </div>
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
