// Mock AI responses for the "Burnout" scenario from the spec
export class MockGuruService {
    constructor() {
        this.conversationStep = 0
        this.scenario = 'burnout'
    }

    async sendMessage(userMessage) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        const lowerMessage = userMessage.toLowerCase()

        // Burnout scenario responses
        if (lowerMessage.includes('burnt out') || lowerMessage.includes('burnout')) {
            this.conversationStep = 1
            return {
                text: `Burnout implies a depletion of Prana (Energy).

The Gita speaks of Yukta-Vihara (Regulated recreation and rest).

Are you driving them with 'Raja-Guna' (Passion/Restless activity) without pausing for recharge? Or is the workload objectively too high?`,
                sutra: null
            }
        }

        if (this.conversationStep === 1 && (lowerMessage.includes('workload') || lowerMessage.includes('understaffed'))) {
            this.conversationStep = 2
            return {
                text: `Then the strategic error is in Resource Allocation, not just Motivation.

Your Sadhana must be to protect your team.

A leader acts as a shield.

Let us draft a data-backed proposal to management for more resources. Shall we begin?`,
                sutra: {
                    title: 'Rakshaka Dharma',
                    translation: 'The Duty of Protection',
                    insight: 'A true leader does not merely drive the team forward. They stand as a shield, protecting their people from unreasonable demands and ensuring sustainable performance.'
                },
                sadhana: [
                    'Document current team capacity vs. workload (use data, not emotions)',
                    'Identify 3 critical tasks that are delayed due to understaffing',
                    'Draft a 1-page proposal to leadership with clear ROI of adding resources'
                ]
            }
        }

        // Delegation scenario
        if (lowerMessage.includes('delegate') || lowerMessage.includes('delegation')) {
            return {
                text: `You fear failure. But Brahma Sutra 2.1 reminds us that the Effect exists in the Cause.

If the 'Cause' (your team) is unprepared, the 'Effect' (failure) is certain.

Have you invested in their preparation, or are you just hoarding the work?`,
                sutra: {
                    title: 'Kartavya',
                    translation: 'Duty',
                    insight: 'As a leader, your Dharma is not to do the work, but to enable the work. Holding on is attachment, not leadership.'
                }
            }
        }

        // Decision fatigue
        if (lowerMessage.includes('decision') || lowerMessage.includes('overwhelmed')) {
            return {
                text: `Decision fatigue comes from treating all choices as equal.

The Gita teaches Viveka (Discrimination) - knowing what truly matters.

Are you spending energy on trivial decisions that should be delegated or systematized?`,
                sutra: {
                    title: 'Viveka',
                    translation: 'Discrimination',
                    insight: 'Not all decisions deserve your attention. Distinguish between the strategic and the trivial. Your energy is finite; spend it wisely.'
                }
            }
        }

        // Default response
        return {
            text: `I hear your challenge.

Let us apply Manthan (Churning) to this situation - separating the Visha (Poison/Problem) from the Amrita (Nectar/Solution).

Tell me more about the specific situation you're facing.`,
            sutra: null
        }
    }

    reset() {
        this.conversationStep = 0
    }
}
