import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGuruStore = defineStore('guru', () => {
    // User Persona (Phase A)
    const userPersona = ref({
        role: '',
        industry: '',
        challenge: '',
        gunas: [] // Sattva/Rajas/Tamas traits
    })

    // Chat History
    const chatHistory = ref([])

    // Current Sutra Card
    const currentSutra = ref(null)

    // Sadhana (Action Items)
    const sadhanaItems = ref([])

    // AI Mode: 'mock' or 'gemini'
    const aiMode = ref('mock')

    // Gemini API Key
    const geminiApiKey = ref('')

    // Functions
    function setUserPersona(persona) {
        userPersona.value = { ...userPersona.value, ...persona }
    }

    function addMessage(message) {
        chatHistory.value.push({
            id: Date.now(),
            ...message,
            timestamp: new Date()
        })
    }

    function showSutra(sutra) {
        currentSutra.value = sutra
    }

    function hideSutra() {
        currentSutra.value = null
    }

    function setSadhana(items) {
        sadhanaItems.value = items.map((item, index) => ({
            id: index,
            text: item,
            completed: false
        }))
    }

    function toggleSadhanaItem(id) {
        const item = sadhanaItems.value.find(i => i.id === id)
        if (item) {
            item.completed = !item.completed
        }
    }

    function setAiMode(mode) {
        aiMode.value = mode
    }

    function setGeminiApiKey(key) {
        geminiApiKey.value = key
    }

    function resetChat() {
        chatHistory.value = []
        currentSutra.value = null
    }

    return {
        userPersona,
        chatHistory,
        currentSutra,
        sadhanaItems,
        aiMode,
        geminiApiKey,
        setUserPersona,
        addMessage,
        showSutra,
        hideSutra,
        setSadhana,
        toggleSadhanaItem,
        setAiMode,
        setGeminiApiKey,
        resetChat
    }
})
