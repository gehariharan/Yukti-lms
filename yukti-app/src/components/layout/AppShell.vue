<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learningStore'
import Button from '@/components/ui/button/Button.vue'
import { Settings, Sparkles, RotateCcw } from 'lucide-vue-next'

const router = useRouter()
const learningStore = useLearningStore()

const showSettings = ref(false)
const tempApiKey = ref(learningStore.aiApiKey)
const tempGroqApiKey = ref(learningStore.groqApiKey)
const tempAiMode = ref(learningStore.aiMode)

function toggleAiMode() {
  const modes = ['demo', 'groq', 'gemini']
  const currentIndex = modes.indexOf(learningStore.aiMode)
  const nextMode = modes[(currentIndex + 1) % modes.length]
  learningStore.setAiMode(nextMode)
}

function saveSettings() {
  learningStore.setAiApiKey(tempApiKey.value)
  learningStore.setGroqApiKey(tempGroqApiKey.value)
  learningStore.setAiMode(tempAiMode.value)
  showSettings.value = false
}

function openSettings() {
  tempApiKey.value = learningStore.aiApiKey
  tempGroqApiKey.value = learningStore.groqApiKey
  tempAiMode.value = learningStore.aiMode
  showSettings.value = true
}

function resetDemo() {
  if (confirm('Reset all data and start fresh? This will clear your onboarding and all challenge progress.')) {
    learningStore.clearAllData()
    showSettings.value = false
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <header class="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img
              src="https://aaroha.co.in/wp-content/uploads/2024/12/Asset-167.svg"
              alt="Yukti Logo"
              class="h-10 w-auto"
            />
            <div>
              <h1 class="text-xl font-bold text-foreground">YUKTI</h1>
              <p class="text-xs text-yukti-slate">Practice leadership in action.</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="toggleAiMode" class="gap-2">
              <Sparkles :size="16" />
              <span class="text-xs">
                {{ learningStore.aiMode === 'demo' ? 'Demo Mode' : learningStore.aiMode === 'groq' ? 'Groq AI' : 'Gemini AI' }}
              </span>
            </Button>
            <Button variant="ghost" size="icon" @click="openSettings">
              <Settings :size="18" />
            </Button>
          </div>
        </div>

      </div>
    </header>

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>

    <footer class="border-t border-border py-4 bg-card/30">
      <div class="container mx-auto px-4">
        <p class="text-xs text-center text-yukti-slate">
          Built for leaders who learn by doing.
        </p>
      </div>
    </footer>

    <!-- Settings Side Panel -->
    <Transition name="slide-panel">
      <div v-if="showSettings" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" @click="showSettings = false"></div>

        <!-- Panel -->
        <div class="relative w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto">
          <div class="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
            <h2 class="text-lg font-semibold text-foreground">Settings</h2>
            <button
              @click="showSettings = false"
              class="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>

          <div class="px-6 py-6 space-y-6">
            <!-- AI Coach Configuration -->
            <div class="space-y-4">
              <h3 class="text-sm font-semibold text-foreground">AI Coach Configuration</h3>

              <!-- AI Mode Selection -->
              <div>
                <label class="text-xs text-muted-foreground block mb-2">Coach Mode</label>
                <div class="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    :variant="tempAiMode === 'demo' ? 'default' : 'outline'"
                    @click="tempAiMode = 'demo'"
                    class="w-full"
                  >
                    Demo
                  </Button>
                  <Button
                    size="sm"
                    :variant="tempAiMode === 'groq' ? 'default' : 'outline'"
                    @click="tempAiMode = 'groq'"
                    class="w-full"
                  >
                    Groq AI
                  </Button>
                  <Button
                    size="sm"
                    :variant="tempAiMode === 'gemini' ? 'default' : 'outline'"
                    @click="tempAiMode = 'gemini'"
                    class="w-full"
                  >
                    Gemini
                  </Button>
                </div>
              </div>

              <!-- Groq API Key -->
              <div v-if="tempAiMode === 'groq'" class="space-y-2">
                <label class="text-xs text-muted-foreground block">
                  Groq API Key
                </label>
                <input
                  v-model="tempGroqApiKey"
                  type="password"
                  placeholder="Enter your Groq API key"
                  class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-yukti-saffron"
                />
                <p class="text-xs text-muted-foreground">
                  Get your API key from <a href="https://console.groq.com" target="_blank" class="text-yukti-saffron hover:underline">console.groq.com</a>
                </p>
              </div>

              <!-- Gemini API Key -->
              <div v-if="tempAiMode === 'gemini'" class="space-y-2">
                <label class="text-xs text-muted-foreground block">
                  Gemini API Key
                </label>
                <input
                  v-model="tempApiKey"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-yukti-saffron"
                />
              </div>

              <div class="flex gap-2 pt-2">
                <Button @click="saveSettings" class="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" @click="showSettings = false" class="flex-1">
                  Cancel
                </Button>
              </div>
            </div>

            <!-- Demo Management -->
            <div class="space-y-4 pt-6 border-t border-border">
              <h3 class="text-sm font-semibold text-foreground">Demo Management</h3>
              <div class="rounded-lg bg-muted/50 p-4 space-y-3">
                <p class="text-xs text-muted-foreground">
                  Reset all onboarding data and challenge progress to start fresh for a new demo.
                </p>
                <Button variant="destructive" @click="resetDemo" class="gap-2 w-full">
                  <RotateCcw :size="14" />
                  Reset All Data
                </Button>
              </div>
            </div>

            <!-- About -->
            <div class="space-y-4 pt-6 border-t border-border">
              <h3 class="text-sm font-semibold text-foreground">About</h3>
              <div class="text-xs text-muted-foreground space-y-2">
                <p>Yukti Learning Platform</p>
                <p>Built for leaders who learn by doing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 0.3s ease;
}

.slide-panel-enter-active .relative,
.slide-panel-leave-active .relative {
  transition: transform 0.3s ease;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
}

.slide-panel-enter-from .relative {
  transform: translateX(100%);
}

.slide-panel-leave-to .relative {
  transform: translateX(100%);
}
</style>
