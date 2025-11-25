<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGuruStore } from '@/stores/guruStore'
import { MockGuruService } from '@/services/mockGuru'
import { GeminiService } from '@/services/gemini'
import ChatInterface from '@/components/yukti/ChatInterface.vue'
import SutraCard from '@/components/yukti/SutraCard.vue'
import SadhanaList from '@/components/yukti/SadhanaList.vue'

const router = useRouter()
const guruStore = useGuruStore()

const chatInterface = ref(null)
const mockGuru = new MockGuruService()
const geminiGuru = ref(null)

// Redirect if no persona set
onMounted(() => {
  if (!guruStore.userPersona.role) {
    router.push('/')
  }
})

// Initialize Gemini if API key is present
watch(() => guruStore.geminiApiKey, (newKey) => {
  if (newKey) {
    geminiGuru.value = new GeminiService(newKey)
  }
}, { immediate: true })

async function handleMessage(text) {
  chatInterface.value?.setLoading(true)
  
  try {
    let response
    
    if (guruStore.aiMode === 'gemini' && geminiGuru.value) {
      // Real AI Mode
      const aiResponse = await geminiGuru.value.sendMessage(text)
      
      // Try to get a Sutra contextually (every 3rd message or if explicitly asked?)
      // For MVP, let's just check if the response is long enough to warrant a Sutra
      let sutra = null
      if (aiResponse.length > 100) {
        sutra = await geminiGuru.value.getSutraForContext(text)
      }
      
      response = { text: aiResponse, sutra }
    } else {
      // Mock Mode
      response = await mockGuru.sendMessage(text)
    }

    // Add Guru response
    guruStore.addMessage({
      role: 'guru',
      text: response.text
    })

    // Handle Sutra
    if (response.sutra) {
      guruStore.showSutra(response.sutra)
    }

    // Handle Sadhana (Mock only for now, or parse from Gemini if we get fancy)
    if (response.sadhana) {
      guruStore.setSadhana(response.sadhana)
    }

  } catch (error) {
    guruStore.addMessage({
      role: 'guru',
      text: "My connection to the cosmic consciousness is interrupted. Please check your API key or internet connection."
    })
    console.error(error)
  } finally {
    chatInterface.value?.setLoading(false)
  }
}

function closeSutra() {
  guruStore.hideSutra()
}
</script>

<template>
  <div class="flex h-full bg-background">
    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col relative">
      <ChatInterface 
        ref="chatInterface"
        @message-sent="handleMessage"
      />
      
      <!-- Sutra Overlay -->
      <SutraCard 
        :sutra="guruStore.currentSutra" 
        @close="closeSutra"
      />
    </div>

    <!-- Right Sidebar (Sadhana & Info) -->
    <div class="w-80 border-l border-border bg-card/30 hidden md:flex flex-col p-4 gap-4">
      <div class="text-sm font-medium text-muted-foreground mb-2">
        Context: {{ guruStore.userPersona.role }}
      </div>
      
      <SadhanaList />
      
      <div class="mt-auto p-4 bg-yukti-saffron/5 rounded-lg border border-yukti-saffron/10">
        <h4 class="text-xs font-bold text-yukti-saffron uppercase mb-2">Guru's Wisdom</h4>
        <p class="text-xs text-muted-foreground italic">
          "Success is not the absence of problems, but the ability to deal with them."
        </p>
      </div>
    </div>
  </div>
</template>
