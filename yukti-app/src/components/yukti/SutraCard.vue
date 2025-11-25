<script setup>
import { ref, watch } from 'vue'
import Card from '@/components/ui/card/Card.vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  sutra: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const isVisible = ref(false)

watch(() => props.sutra, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      isVisible.value = true
    }, 100)
  } else {
    isVisible.value = false
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="sutra && isVisible"
      class="fixed bottom-8 right-8 z-50 w-96 animate-in slide-in-from-bottom-5"
    >
      <Card class="bg-gradient-to-br from-yukti-saffron/10 to-yukti-saffron/5 border-yukti-saffron/30 shadow-2xl">
        <div class="p-6 relative">
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 text-yukti-slate/50 hover:text-yukti-slate transition-colors"
          >
            <X :size="20" />
          </button>

          <div class="mb-4">
            <div class="inline-block px-3 py-1 bg-yukti-saffron/20 rounded-full mb-3">
              <span class="text-xs font-semibold text-yukti-saffron uppercase tracking-wider">
                Sutra
              </span>
            </div>
            <h3 class="text-2xl font-bold text-foreground mb-1">
              {{ sutra.title }}
            </h3>
            <p class="text-sm text-yukti-slate italic">
              {{ sutra.translation }}
            </p>
          </div>

          <div class="border-l-4 border-yukti-saffron pl-4">
            <p class="text-foreground leading-relaxed">
              {{ sutra.insight }}
            </p>
          </div>

          <div class="mt-4 pt-4 border-t border-yukti-saffron/20">
            <p class="text-xs text-yukti-slate text-center">
              Ancient Wisdom. Modern Action.
            </p>
          </div>
        </div>
      </Card>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
