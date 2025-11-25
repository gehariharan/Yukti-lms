<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useGuruStore } from '@/stores/guruStore'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import { Send, Loader2 } from 'lucide-vue-next'

const guruStore = useGuruStore()
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)

const emit = defineEmits(['message-sent'])

const messages = computed(() => guruStore.chatHistory)

async function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return

  const message = userInput.value.trim()
  userInput.value = ''
  
  // Add user message
  guruStore.addMessage({
    role: 'user',
    text: message
  })

  emit('message-sent', message)
  
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

defineExpose({
  setLoading: (loading) => {
    isLoading.value = loading
  }
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Chat Messages -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-6 space-y-4"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
            message.role === 'user'
              ? 'bg-yukti-saffron text-white'
              : 'bg-card border border-border'
          ]"
        >
          <div v-if="message.role === 'guru'" class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-yukti-saffron/20 flex items-center justify-center">
              <span class="text-yukti-saffron font-bold text-sm">🕉</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-yukti-saffron mb-1">The Guru</p>
              <div class="text-foreground whitespace-pre-line leading-relaxed">
                {{ message.text }}
              </div>
            </div>
          </div>
          <div v-else class="text-sm leading-relaxed">
            {{ message.text }}
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-yukti-saffron/20 flex items-center justify-center">
              <span class="text-yukti-saffron font-bold text-sm">🕉</span>
            </div>
            <div class="flex items-center gap-2">
              <Loader2 :size="16" class="animate-spin text-yukti-saffron" />
              <span class="text-sm text-muted-foreground">The Guru is contemplating...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="border-t border-border p-4 bg-background">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <Input
          v-model="userInput"
          placeholder="Share your challenge with The Guru..."
          class="flex-1"
          :disabled="isLoading"
          @keydown.enter.prevent="sendMessage"
        />
        <Button
          type="submit"
          :disabled="!userInput.trim() || isLoading"
          size="icon"
          class="flex-shrink-0"
        >
          <Send :size="18" />
        </Button>
      </form>
    </div>
  </div>
</template>
