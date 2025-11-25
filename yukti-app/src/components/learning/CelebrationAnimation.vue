<template>
  <div v-if="show" class="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
    <!-- Confetti particles -->
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="absolute"
      :style="{
        left: particle.x + '%',
        top: particle.y + '%',
        animation: `confetti-fall ${particle.duration}s linear forwards`,
        animationDelay: particle.delay + 's'
      }"
    >
      <div
        class="w-2 h-2 rounded-full"
        :class="particle.color"
        :style="{ transform: `rotate(${particle.rotation}deg)` }"
      />
    </div>

    <!-- Success message card -->
    <div class="animate-bounce-in pointer-events-auto">
      <div class="rounded-2xl bg-gradient-to-br from-yukti-saffron via-orange-400 to-orange-500 p-1 shadow-2xl">
        <div class="rounded-xl bg-white p-8 text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yukti-saffron/20 to-orange-500/20 mb-4">
            <svg class="w-12 h-12 text-yukti-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-foreground mb-2">{{ title }}</h2>
          <p class="text-sm text-muted-foreground max-w-sm">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Challenge Complete!'
  },
  message: {
    type: String,
    default: 'Great work! Moving to the next challenge...'
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['done'])

const particles = ref([])

const colors = [
  'bg-yukti-saffron',
  'bg-orange-400',
  'bg-orange-500',
  'bg-yellow-400',
  'bg-amber-500',
  'bg-red-400'
]

function generateParticles() {
  particles.value = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    rotation: Math.random() * 360,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)]
  }))
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      generateParticles()

      setTimeout(() => {
        emit('done')
      }, props.duration)
    }
  }
)

onMounted(() => {
  if (props.show) {
    generateParticles()
  }
})
</script>

<style scoped>
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
