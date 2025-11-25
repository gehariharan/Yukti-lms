<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learningStore'
import Card from '@/components/ui/card/Card.vue'
import Button from '@/components/ui/button/Button.vue'
import AarohaAvatar from '@/components/learning/AarohaAvatar.vue'
import { Lock, MessageCircle, X } from 'lucide-vue-next'

const router = useRouter()
const learningStore = useLearningStore()

const showCoachChat = ref(false)

function openCoachChat() {
  router.push('/coach')
}

const trackCards = [
  {
    id: 'drg-drishya-viveka',
    title: 'Aaroha Leader: Drg Drishya Viveka',
    summary: 'Distinguish between the observer and the observed. Build self-awareness through ancient wisdom.',
    status: 'coming_soon',
    challenges: 4,
    image: '/Aaroha Leader.webp',
    category: 'Leader'
  },
  {
    id: 'swadharma',
    title: 'Aaroha Leader: Swadharma',
    summary: 'Discover your unique dharma. Lead from your authentic purpose and values.',
    status: 'coming_soon',
    challenges: 5,
    image: '/Aaroha Leader.webp',
    category: 'Leader'
  },
  {
    id: 'me-in-my-team',
    title: 'Aaroha Teams: Me in My Team',
    summary: 'Build awareness of how you show up with your team through values-based challenges.',
    status: 'available',
    challenges: 3,
    badge: 'Active',
    image: '/Aaroha Teams.webp',
    category: 'Teams'
  },
  {
    id: 'lead-organization',
    title: 'Aaroha Organization: Lead at an Organization Level',
    summary: 'Scale your leadership impact across the organization. Navigate complexity with clarity.',
    status: 'coming_soon',
    challenges: 6,
    image: '/Aaroha Organization.webp',
    category: 'Organization'
  },
  {
    id: 'me-and-my-team',
    title: 'Aaroha Teams: Me and My Team',
    summary: 'Collaborative multi-learner asynchronous learning experience. Build team alignment together.',
    status: 'upcoming',
    challenges: 4,
    badge: 'Upcoming',
    image: '/Aaroha Teams.webp',
    category: 'Teams'
  }
]

const participantName = computed(() => learningStore.participant.name || 'there')

onMounted(() => {
  if (!learningStore.isOnboarded) {
    router.replace('/')
  }
})

function getProgressLabel(track) {
  if (track.status !== 'available') {
    return `${track.challenges} challenges`
  }

  const completed = learningStore.getCompletedCount(track.id)
  return completed
    ? `${completed}/${track.challenges} challenges complete`
    : `${track.challenges} challenges`
}

function getStatusLabel(status) {
  if (status === 'available') return 'Available now'
  if (status === 'upcoming') return 'Upcoming'
  return 'Coming soon'
}

function openTrack(track) {
  if (track.status !== 'available') return
  router.push('/tracks/me-in-my-team')
}

function hasActionItems(trackId) {
  const actionItems = learningStore.getTrackActionItems(trackId)
  return actionItems && actionItems.length > 0
}

function isTrackComplete(trackId) {
  if (trackId === 'me-in-my-team') {
    return learningStore.getCompletedCount(trackId) === 3
  }
  return false
}
</script>

<template>
  <div class="min-h-full px-4 py-10 relative overflow-hidden">
    <!-- Background decoration with gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background"></div>

    <!-- Hero SVG decoration - top right -->
    <div class="absolute -bottom-20 -right-20 w-[600px] h-[600px] opacity-[0.07] pointer-events-none">
      <img src="/Hero-Section-01.svg" alt="" class="w-full h-full object-contain rotate-12" />
    </div>

    <!-- Hero SVG decoration - bottom left -->
    <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] opacity-[0.05] pointer-events-none">
      <img src="/Hero-Section-01.svg" alt="" class="w-full h-full object-contain -rotate-12" />
    </div>

    <div class="max-w-6xl mx-auto space-y-8 relative z-10">
      <div class="space-y-3">
        <p class="text-sm text-muted-foreground uppercase tracking-[0.4em]">Learning tracks</p>
        <h1 class="text-4xl font-bold text-foreground">Pick where to focus, {{ participantName }}</h1>
        <p class="text-base text-muted-foreground max-w-3xl leading-relaxed">
          Each track is a curated sequence of challenges. Complete a challenge to unlock the next and
          watch how Aaroha Coach layers insights tailored to your context.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="track in trackCards"
          :key="track.id"
          class="overflow-hidden flex flex-col border-border/70 hover:border-yukti-saffron/30 transition-all duration-300 bg-card/95 backdrop-blur-sm"
          :class="{ 'opacity-75': track.status !== 'available', 'shadow-lg hover:shadow-xl': track.status === 'available' }"
        >
          <!-- Track Image Header -->
          <div class="relative h-40 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            <img
              :src="track.image"
              :alt="track.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>

            <!-- Category badge -->
            <div class="absolute top-4 left-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs bg-card/90 backdrop-blur-sm border border-border font-semibold text-foreground">
                {{ track.category }}
              </span>
            </div>

            <!-- Status badge -->
            <span
              v-if="track.badge"
              class="absolute top-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
              :class="track.status === 'available'
                ? 'bg-yukti-saffron text-white shadow-md'
                : 'bg-card/90 backdrop-blur-sm border border-border text-foreground'"
            >
              {{ track.badge }}
            </span>
          </div>

          <!-- Track Content -->
          <div class="p-4 flex flex-col flex-1 bg-card">
            <div class="space-y-2 flex-1">
              <div>
                <p class="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  {{ getStatusLabel(track.status) }}
                </p>
                <h2 class="text-base font-semibold text-foreground leading-tight line-clamp-2">{{ track.title }}</h2>
              </div>
              <p class="text-xs text-muted-foreground leading-relaxed line-clamp-3">{{ track.summary }}</p>
              <p class="text-[10px] font-medium text-yukti-slate uppercase pt-1">
                {{ getProgressLabel(track) }}
              </p>

              <!-- Action Items Badge -->
              <div v-if="isTrackComplete(track.id) && hasActionItems(track.id)" class="pt-2">
                <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yukti-saffron/10 border border-yukti-saffron/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yukti-saffron">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                  </svg>
                  <span class="text-[10px] font-semibold text-yukti-saffron uppercase tracking-wider">Action items ready</span>
                </div>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-border">
              <Button
                class="w-full"
                size="sm"
                :variant="track.status === 'available' ? 'default' : 'outline'"
                :disabled="track.status !== 'available'"
                @click="openTrack(track)"
              >
                <template v-if="track.status === 'available'">
                  Enter track
                </template>
                <template v-else>
                  <Lock class="mr-1 h-3 w-3" /> Locked
                </template>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Aaroha Coach Chat Bubble -->
      <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
      <!-- Chat Window -->
      <Transition name="slide-up">
        <div
          v-if="showCoachChat"
          class="w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden backdrop-blur-sm"
        >
          <!-- Header -->
          <div class="bg-gradient-to-r from-yukti-saffron to-orange-500 px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <AarohaAvatar />
              <div>
                <h3 class="text-sm font-semibold text-white">Aaroha Coach</h3>
                <p class="text-xs text-white/80">Here to support your journey</p>
              </div>
            </div>
            <button
              @click="showCoachChat = false"
              class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
              aria-label="Close chat"
            >
              <X :size="18" />
            </button>
          </div>
          
          <!-- Chat Content -->
          <div class="p-4 bg-muted/30 space-y-4 max-h-96 overflow-y-auto">
            <div class="rounded-xl bg-card p-4 border border-border shadow-sm">
              <p class="text-sm text-foreground leading-relaxed">
                Hi <strong>{{ participantName }}</strong>! 👋
              </p>
              <p class="text-sm text-foreground leading-relaxed mt-2">
                I'm here whenever you need guidance, have questions about a track, or want to discuss coaching help on a specific challenge.
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-xs text-muted-foreground uppercase tracking-wider px-1">Quick conversations:</p>
              <button
                @click="openCoachChat"
                class="w-full text-left px-4 py-3 rounded-lg bg-card border border-border hover:border-yukti-saffron hover:bg-muted/50 transition-all text-sm group"
              >
                <span class="group-hover:translate-x-1 inline-block transition-transform">💡 Lets talk about a new challenge</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
      
      <!-- Chat Bubble Button -->
      <button
        @click="showCoachChat = !showCoachChat"
        :class="[
          'group relative rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 overflow-hidden',
          showCoachChat 
            ? 'w-14 h-14 bg-gradient-to-r from-yukti-saffron to-orange-500' 
            : 'w-14 h-14 hover:w-auto hover:pr-4 bg-gradient-to-r from-yukti-saffron to-orange-500 pulse-animation'
        ]"
        aria-label="Open Aaroha Coach chat"
      >
        <div class="flex-shrink-0 w-14 h-14 flex items-center justify-center">
          <Transition name="icon-fade" mode="out-in">
            <X v-if="showCoachChat" :size="24" key="close" class="text-white" />
            <AarohaAvatar v-else key="avatar" />
          </Transition>
        </div>
        <!-- Text that appears on hover -->
        <span
          v-if="!showCoachChat"
          class="text-sm font-semibold text-white whitespace-nowrap pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75"
        >
          Aaroha Coach
        </span>
        <!-- Pulse ring effect when closed -->
        <span
          v-if="!showCoachChat"
          class="absolute inset-0 rounded-full bg-yukti-saffron/30 animate-ping opacity-75 pointer-events-none"
        ></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Chat window slide-up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Icon fade animation */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

/* Text expand animation */
.text-expand-enter-active,
.text-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-expand-enter-from {
  opacity: 0;
  transform: translateX(-10px);
  width: 0;
}

.text-expand-leave-to {
  opacity: 0;
  transform: translateX(-10px);
  width: 0;
}

/* Pulse animation for chat button */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.pulse-animation::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(251, 146, 60, 0.3);
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
