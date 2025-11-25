import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'yukti-learning-data'

// Load from localStorage
function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : null
    } catch (error) {
        console.error('Failed to load from localStorage:', error)
        return null
    }
}

// Save to localStorage
function saveToStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Failed to save to localStorage:', error)
    }
}

export const useLearningStore = defineStore('learning', () => {
    const stored = loadFromStorage()

    const participant = ref(stored?.participant || {
        name: '',
        role: '',
        industry: '',
        teamSize: ''
    })

    const trackProgress = ref(stored?.trackProgress || {
        'me-in-my-team': {
            completed: [],
            responses: {},
            actionItems: []
        }
    })

    const aiMode = ref(stored?.aiMode || 'demo')
    const aiApiKey = ref(stored?.aiApiKey || '')
    const groqApiKey = ref(stored?.groqApiKey || import.meta.env.VITE_GROQ_API_KEY || '')
    const coachFeedback = ref(stored?.coachFeedback || {})

    // Watch for changes and persist to localStorage
    watch(
        [participant, trackProgress, aiMode, aiApiKey, groqApiKey, coachFeedback],
        () => {
            saveToStorage({
                participant: participant.value,
                trackProgress: trackProgress.value,
                aiMode: aiMode.value,
                aiApiKey: aiApiKey.value,
                groqApiKey: groqApiKey.value,
                coachFeedback: coachFeedback.value
            })
        },
        { deep: true }
    )

    const isOnboarded = computed(() =>
        Boolean(participant.value.name && participant.value.role && participant.value.industry)
    )

    function setParticipant(payload) {
        participant.value = { ...participant.value, ...payload }
    }

    function resetTrack(trackId) {
        trackProgress.value[trackId] = {
            completed: [],
            responses: {},
            actionItems: []
        }
    }

    function ensureTrack(trackId) {
        if (!trackProgress.value[trackId]) {
            resetTrack(trackId)
        }
        return trackProgress.value[trackId]
    }

    function completeChallenge(trackId, challengeId, data = {}) {
        const progress = ensureTrack(trackId)

        if (!progress.completed.includes(challengeId)) {
            progress.completed.push(challengeId)
        }

        progress.responses[challengeId] = data
    }

    function isChallengeComplete(trackId, challengeId) {
        const progress = trackProgress.value[trackId]
        if (!progress) return false
        return progress.completed.includes(challengeId)
    }

    function getChallengeData(trackId, challengeId) {
        const progress = trackProgress.value[trackId]
        if (!progress) return null
        return progress.responses[challengeId] || null
    }

    function getCompletedCount(trackId) {
        const progress = trackProgress.value[trackId]
        if (!progress) return 0
        return progress.completed.length
    }

    function setAiMode(mode) {
        aiMode.value = mode
    }

    function setAiApiKey(key) {
        aiApiKey.value = key
    }

    function setGroqApiKey(key) {
        groqApiKey.value = key
    }

    function setCoachFeedback(challengeId, feedback) {
        coachFeedback.value = {
            ...coachFeedback.value,
            [challengeId]: feedback
        }
    }

    function setTrackActionItems(trackId, actionItems) {
        const progress = ensureTrack(trackId)
        progress.actionItems = actionItems
    }

    function getTrackActionItems(trackId) {
        const progress = trackProgress.value[trackId]
        if (!progress) return []
        return progress.actionItems || []
    }

    function clearAllData() {
        participant.value = {
            name: '',
            role: '',
            industry: '',
            teamSize: ''
        }
        trackProgress.value = {
            'me-in-my-team': {
                completed: [],
                responses: {},
                actionItems: []
            }
        }
        aiMode.value = 'demo'
        aiApiKey.value = ''
        groqApiKey.value = import.meta.env.VITE_GROQ_API_KEY || ''
        coachFeedback.value = {}
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        participant,
        trackProgress,
        aiMode,
        aiApiKey,
        groqApiKey,
        coachFeedback,
        isOnboarded,
        setParticipant,
        resetTrack,
        completeChallenge,
        isChallengeComplete,
        getChallengeData,
        getCompletedCount,
        setAiMode,
        setAiApiKey,
        setGroqApiKey,
        setCoachFeedback,
        setTrackActionItems,
        getTrackActionItems,
        clearAllData
    }
})
