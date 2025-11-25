<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learningStore'
import ChallengeLayout from '@/components/learning/ChallengeLayout.vue'
import CelebrationAnimation from '@/components/learning/CelebrationAnimation.vue'
import SelfVsOthersChallenge from '@/components/learning/challenges/SelfVsOthersChallenge.vue'
import ValuesRecognitionChallenge from '@/components/learning/challenges/ValuesRecognitionChallenge.vue'
import ValuesResponseChallenge from '@/components/learning/challenges/ValuesResponseChallenge.vue'
import { loadMeInMyTeamChallenges } from '@/content/meInMyTeam'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()
const route = useRoute()
const learningStore = useLearningStore()

const trackId = 'me-in-my-team'
const challenges = ref([])
const currentChallengeId = ref(null)
const loadingContent = ref(true)
const loadError = ref('')
const showCelebration = ref(false)
const celebrationMessage = ref({ title: '', message: '' })

const componentMap = {
  reflection: SelfVsOthersChallenge,
  'values-recognition': ValuesRecognitionChallenge,
  'values-response': ValuesResponseChallenge
}

const challengeOrder = computed(() => challenges.value.map(challenge => challenge.id))
const totalChallenges = computed(() => challengeOrder.value.length)

onMounted(async () => {
  if (!learningStore.isOnboarded) {
    router.replace('/')
    return
  }

  try {
    challenges.value = await loadMeInMyTeamChallenges()
    syncChallengeFromRoute()
  } catch (error) {
    loadError.value = 'Unable to load track content.'
    console.error(error)
  } finally {
    loadingContent.value = false
  }
})

function isChallengeUnlocked(challengeId) {
  const order = challengeOrder.value
  const targetIndex = order.indexOf(challengeId)
  if (targetIndex === -1) return false
  if (targetIndex === 0) return true

  return order.slice(0, targetIndex).every(id => learningStore.isChallengeComplete(trackId, id))
}

function firstIncompleteChallenge() {
  const order = challengeOrder.value
  const pending = order.find(id => !learningStore.isChallengeComplete(trackId, id))
  return pending || order[order.length - 1]
}

function syncChallengeFromRoute() {
  const order = challengeOrder.value
  if (!order.length) return

  const routeId = route.params.challengeId

  if (!routeId) {
    currentChallengeId.value = null
    return
  }

  if (isChallengeUnlocked(routeId)) {
    currentChallengeId.value = routeId
  } else {
    const fallback = firstIncompleteChallenge()
    router.replace(`/tracks/me-in-my-team/${fallback}`)
    currentChallengeId.value = fallback
  }
}

watch(
  () => route.params.challengeId,
  () => {
    if (!loadingContent.value) {
      syncChallengeFromRoute()
    }
  }
)

const overlayOpen = computed(() => Boolean(currentChallengeId.value))
const currentChallenge = computed(() => challenges.value.find(challenge => challenge.id === currentChallengeId.value))
const currentComponent = computed(() => (currentChallenge.value ? componentMap[currentChallenge.value.id] : null))

const savedData = computed(() =>
  currentChallengeId.value ? learningStore.getChallengeData(trackId, currentChallengeId.value) : null
)
const valuesInsights = computed(() => learningStore.getChallengeData(trackId, 'values-recognition'))

const challengeProps = computed(() => {
  if (!currentChallenge.value) return {}

  const payload = {
    config: currentChallenge.value.data,
    savedData: savedData.value || undefined
  }

  if (currentChallenge.value.id === 'values-response') {
    payload.valuesInsights = valuesInsights.value || undefined
  }

  return payload
})

const challengeListWithStatus = computed(() => {
  const order = challengeOrder.value
  return order.map((id, index) => {
    const config = challenges.value.find(challenge => challenge.id === id)
    const completed = learningStore.isChallengeComplete(trackId, id)
    const unlocked = isChallengeUnlocked(id)
    return {
      id,
      index,
      title: config?.title,
      description: config?.description,
      status: completed ? 'completed' : unlocked ? 'available' : 'locked'
    }
  })
})

const completedCount = computed(() => learningStore.getCompletedCount(trackId))
const trackComplete = computed(() => {
  if (!challengeOrder.value.length) return false
  return challengeOrder.value.every(id => learningStore.isChallengeComplete(trackId, id))
})
const actionItems = computed(() => learningStore.getTrackActionItems(trackId))

function openChallenge(id) {
  if (!isChallengeUnlocked(id)) return
  router.push(`/tracks/me-in-my-team/${id}`)
}

function closeChallenge() {
  currentChallengeId.value = null
  if (route.params.challengeId) {
    router.push('/tracks/me-in-my-team')
  }
}

function handleCompleted(payload) {
  if (!currentChallengeId.value) return

  learningStore.completeChallenge(trackId, currentChallengeId.value, payload)

  const order = challengeOrder.value
  const currentIndex = order.indexOf(currentChallengeId.value)
  const nextChallenge = order[currentIndex + 1]

  // Show celebration
  const currentChallenge = challenges.value.find(c => c.id === currentChallengeId.value)
  if (nextChallenge) {
    celebrationMessage.value = {
      title: 'Challenge Complete!',
      message: `Moving to ${challenges.value.find(c => c.id === nextChallenge)?.title || 'next challenge'}...`
    }
  } else {
    celebrationMessage.value = {
      title: '🎉 Track Complete!',
      message: 'You\'ve finished "Me in My Team". Amazing work!'
    }
  }

  showCelebration.value = true
}

function generateActionItems() {
  // Generate personalized action items based on user's context and responses
  const participant = learningStore.participant
  const valuesData = learningStore.getChallengeData(trackId, 'values-recognition')
  const responseData = learningStore.getChallengeData(trackId, 'values-response')

  const items = [
    {
      id: 1,
      title: 'Share your values with your team',
      description: `Have a conversation with your team about the values that guide your leadership. Consider starting your next team meeting by sharing 2-3 of your core values.`,
      category: 'Communication',
      timeframe: 'This week'
    },
    {
      id: 2,
      title: 'Observe values in action',
      description: `Pay attention to moments when your values align or clash with team dynamics. Keep a simple journal noting these observations.`,
      category: 'Reflection',
      timeframe: 'Ongoing'
    },
    {
      id: 3,
      title: 'Create alignment opportunities',
      description: `Identify one upcoming decision or project where you can explicitly involve your team in values-based discussion. Use this as a chance to build shared understanding.`,
      category: 'Practice',
      timeframe: 'Next 2 weeks'
    }
  ]

  // Add a context-specific action item
  if (participant.teamSize && parseInt(participant.teamSize) > 10) {
    items.push({
      id: 4,
      title: 'Build values alignment with team leads',
      description: `With a larger team, start by aligning with your direct reports first. Schedule 1-on-1s to discuss how their values connect with team goals.`,
      category: 'Leadership',
      timeframe: 'This month'
    })
  }

  return items
}

function onCelebrationDone() {
  showCelebration.value = false

  const order = challengeOrder.value
  const currentIndex = order.indexOf(currentChallengeId.value)
  const nextChallenge = order[currentIndex + 1]

  if (nextChallenge) {
    router.push(`/tracks/me-in-my-team/${nextChallenge}`)
  } else {
    // Track is complete - generate and save action items if not already done
    if (actionItems.value.length === 0) {
      const generatedItems = generateActionItems()
      learningStore.setTrackActionItems(trackId, generatedItems)
    }
    closeChallenge()
  }
}

function backToTracks() {
  router.push('/tracks')
}
</script>

<template>
  <div class="min-h-full px-4 py-10 bg-muted/20">
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-muted-foreground">Track</p>
          <h1 class="text-3xl font-semibold text-foreground">Me in My Team</h1>
          <p class="text-sm text-muted-foreground max-w-2xl">
            Three sequential challenges that move from self-awareness to team insight and practice.
            Pick any available challenge card to dive into a full-screen coaching experience.
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-muted-foreground">Progress</p>
          <p class="text-lg font-semibold text-foreground">
            {{ completedCount }} / {{ totalChallenges }} complete
          </p>
          <Button variant="ghost" size="sm" class="mt-2" @click="backToTracks">Back to tracks</Button>
        </div>
      </div>

      <div v-if="loadingContent" class="rounded-xl border border-border bg-card shadow-sm p-10 text-center">
        <p class="text-sm text-muted-foreground">Loading track content…</p>
      </div>

      <div v-else-if="loadError" class="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-6">
        {{ loadError }}
      </div>

      <div v-else class="space-y-6">
        <div v-if="trackComplete" class="space-y-6">
          <!-- Track Complete Message -->
          <div class="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xs uppercase tracking-[0.4em] text-emerald-600 mb-1">Track complete</p>
                <h2 class="text-2xl font-semibold text-foreground">Great work!</h2>
                <p class="text-sm text-muted-foreground mt-1">
                  You've completed all challenges in "Me in My Team". Re-open any challenge card below to revisit your notes or refresh the AI reflections.
                </p>
              </div>
            </div>
          </div>

          <!-- Action Items Section -->
          <div v-if="actionItems.length > 0" class="rounded-xl border border-yukti-saffron/30 bg-card p-6 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-yukti-saffron/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yukti-saffron">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foreground">Your Action Items</h3>
                <p class="text-xs text-muted-foreground">Personalized next steps to bring your insights into practice</p>
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="item in actionItems"
                :key="item.id"
                class="rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-start justify-between gap-3 mb-2">
                  <h4 class="font-semibold text-foreground text-sm">{{ item.title }}</h4>
                  <div class="flex gap-2 flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-yukti-saffron/10 text-yukti-saffron text-[10px] font-medium uppercase tracking-wider">
                      {{ item.category }}
                    </span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground text-[10px] font-medium">
                      {{ item.timeframe }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground leading-relaxed">{{ item.description }}</p>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-border">
              <p class="text-xs text-muted-foreground italic">
                💡 These action items are based on your responses and leadership context. Feel free to adapt them to your situation.
              </p>
            </div>
          </div>
        </div>

        <!-- Sequential Challenge Flow -->
        <div class="max-w-3xl mx-auto space-y-3">
          <button
            v-for="(challenge, idx) in challengeListWithStatus"
            :key="challenge.id"
            class="w-full rounded-xl border bg-card p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yukti-saffron relative group"
            :class="{
              'border-yukti-saffron shadow-lg hover:shadow-xl': challenge.status === 'available',
              'border-border/70 hover:border-yukti-saffron/50': challenge.status === 'locked',
              'border-emerald-500/30 bg-emerald-500/5': challenge.status === 'completed',
              'cursor-pointer': challenge.status !== 'locked',
              'cursor-not-allowed': challenge.status === 'locked'
            }"
            @click="openChallenge(challenge.id)"
          >
            <!-- Step connector line (except for last item) -->
            <div
              v-if="idx < challengeListWithStatus.length - 1"
              class="absolute left-8 top-full w-0.5 h-3 -mt-0.5"
              :class="challenge.status === 'completed' ? 'bg-emerald-500/30' : 'bg-border'"
            ></div>

            <div class="flex items-start gap-4">
              <!-- Step Number Circle -->
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all"
                :class="{
                  'bg-yukti-saffron text-white border-yukti-saffron': challenge.status === 'available',
                  'bg-emerald-500 text-white border-emerald-500': challenge.status === 'completed',
                  'bg-muted border-border text-muted-foreground': challenge.status === 'locked'
                }"
              >
                <svg v-if="challenge.status === 'completed'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <span v-else>{{ challenge.index + 1 }}</span>
              </div>

              <!-- Challenge Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-base font-semibold text-foreground">{{ challenge.title }}</h3>
                  <span
                    v-if="challenge.status === 'available'"
                    class="inline-flex items-center rounded-full bg-yukti-saffron/10 text-yukti-saffron px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  >
                    Start
                  </span>
                  <span
                    v-else-if="challenge.status === 'locked'"
                    class="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Locked
                  </span>
                </div>
                <p class="text-sm leading-relaxed" :class="challenge.status === 'locked' ? 'text-foreground/70' : 'text-foreground'">
                  {{ challenge.description }}
                </p>
              </div>

              <!-- Arrow indicator for available challenges -->
              <div
                v-if="challenge.status === 'available'"
                class="flex-shrink-0 text-yukti-saffron opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <ChallengeLayout
      v-if="overlayOpen && currentChallenge && currentComponent"
      ref="challengeLayoutRef"
      track-title="Me in My Team"
      :challenge-title="currentChallenge.title"
      :challenge-description="currentChallenge.description"
      :challenge-index="challengeOrder.indexOf(currentChallenge.id)"
      :total-challenges="challengeOrder.length"
      :concept="currentChallenge.concept"
      @close="closeChallenge"
    >
      <template #default="{ updateConcept }">
        <component
          :is="currentComponent"
          v-bind="challengeProps"
          @completed="handleCompleted"
          @update-concept="updateConcept"
        />
      </template>
    </ChallengeLayout>

    <!-- Success Animation -->
    <CelebrationAnimation
      :show="showCelebration"
      :title="celebrationMessage.title"
      :message="celebrationMessage.message"
      @done="onCelebrationDone"
    />
  </div>
</template>
