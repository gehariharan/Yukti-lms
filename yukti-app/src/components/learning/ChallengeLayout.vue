<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  trackTitle: {
    type: String,
    required: true
  },
  challengeTitle: {
    type: String,
    required: true
  },
  challengeDescription: {
    type: String,
    default: ''
  },
  challengeIndex: {
    type: Number,
    required: true
  },
  totalChallenges: {
    type: Number,
    required: true
  },
  concept: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

// Dynamic concept state - can be updated by child components
const dynamicConcept = ref({ ...props.concept })
const assetKey = ref(0)

const progressLabel = computed(() => `Challenge ${props.challengeIndex + 1} of ${props.totalChallenges}`)
const displayConcept = computed(() => {
  // Merge props.concept with dynamicConcept, with dynamicConcept taking precedence
  return {
    ...props.concept,
    ...dynamicConcept.value
  }
})

function closeOverlay() {
  emit('close')
}

function updateConcept(updates) {
  console.log('updateConcept called with:', updates)
  // Explicitly update each property to ensure reactivity
  Object.assign(dynamicConcept.value, updates)
  // Trigger reactivity by creating a new object reference
  dynamicConcept.value = { ...dynamicConcept.value }
  // Increment assetKey to force image re-render when asset changes
  if (updates.asset) {
    assetKey.value++
  }
  console.log('dynamicConcept after update:', dynamicConcept.value)
  console.log('displayConcept computed:', displayConcept.value)
}

// Expose to slot content
defineExpose({ updateConcept })

onMounted(() => {
  document.body.dataset.lockScroll = 'true'
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  delete document.body.dataset.lockScroll
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
    <header class="flex flex-col gap-3 border-b border-border/60 bg-card/90 px-6 py-4 shadow-lg lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-1">
        <!-- Breadcrumb -->
        <nav class="text-xs text-muted-foreground flex items-center gap-2 mb-1">
          <span class="hover:text-foreground cursor-pointer">Tracks</span>
          <span>›</span>
          <span>{{ trackTitle }}</span>
          <span>›</span>
          <span class="text-foreground font-medium">{{ challengeTitle }}</span>
        </nav>

        <div class="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
          <h1 class="text-2xl font-semibold text-foreground">{{ challengeTitle }}</h1>
          <span class="text-xs font-semibold text-muted-foreground">{{ progressLabel }}</span>
        </div>
        <p class="text-sm text-muted-foreground max-w-3xl">
          {{ challengeDescription }}
        </p>
      </div>
      <button
        class="self-start rounded-full border border-border/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition hover:border-foreground/80 hover:text-foreground"
        @click="closeOverlay"
      >
        Close
      </button>
    </header>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden">
      <section class="h-full overflow-y-auto border-b border-border/40 bg-card/95 lg:border-b-0 lg:border-r">
        <slot :update-concept="updateConcept" />
      </section>

      <aside class="h-full overflow-y-auto bg-muted/10 p-6 flex flex-col">
        <div class="space-y-3 mb-6">
          <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Framework</p>
          <h3 class="text-xl font-semibold text-foreground">{{ displayConcept.title }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ displayConcept.description }}
          </p>
        </div>

        <div class="flex-1 flex items-center justify-center py-4">
          <div class="max-w-full max-h-full">
            <template v-if="displayConcept.asset">
              <div class="rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                <img
                  :key="`${displayConcept.asset}-${assetKey}`"
                  :src="displayConcept.asset"
                  :alt="displayConcept.title"
                  class="w-full h-auto object-contain max-h-[70vh]"
                  @error="console.error('Image failed to load:', displayConcept.asset)"
                />
              </div>
            </template>
            <template v-else>
              <div class="rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-xs text-muted-foreground px-6">
                  Drop your framework image into
                  <code class="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">public/content/me-in-my-team/</code>
                  and update the concept asset path.
                </p>
              </div>
            </template>
          </div>
        </div>

        <p v-if="displayConcept.caption" class="text-xs text-muted-foreground text-center pt-4 border-t border-border/50 mt-6">
          {{ displayConcept.caption }}
        </p>
      </aside>
    </div>
  </div>
</template>
