import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_GEMINI_MODEL =
    (import.meta?.env && import.meta.env.VITE_GEMINI_MODEL) || 'gemini-flash-latest'

const COACH_SYSTEM_PROMPT = `You are the Yukti AI Coach. You guide modern leaders through structured challenges.

Principles:
1. Stay grounded in the participant's role, industry, and team goals.
2. Explain frameworks in plain business language and connect them to practical actions.
3. Keep responses tight: short paragraphs or bullet points so learners can act immediately.
4. End each exchange with a clear suggestion for what to reflect on or try next.

Forbidden:
- Do not invent frameworks that were not provided.
- Do not discuss religion or spiritual doctrine.
- If an answer requires data you do not have, state the assumption explicitly.`

function extractJson(text) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
        return JSON.parse(match[0])
    } catch {
        return null
    }
}

export class GeminiService {
    constructor(apiKey, { model = DEFAULT_GEMINI_MODEL } = {}) {
        this.genAI = new GoogleGenerativeAI(apiKey)
        this.modelName = model
        this.model = this.genAI.getGenerativeModel({
            model: this.modelName,
            systemInstruction: COACH_SYSTEM_PROMPT
        })
        this.chat = null
    }

    async startChat(history = []) {
        this.chat = this.model.startChat({
            history: history.map(msg => ({
                role: msg.role === 'coach' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }))
        })
    }

    async sendMessage(message) {
        if (!this.chat) {
            await this.startChat()
        }

        try {
            const result = await this.chat.sendMessage(message)
            const response = await result.response
            return response.text()
        } catch (error) {
            console.error('Gemini API Error:', error)
            throw new Error('Failed to get response from the AI Coach. Please verify your API key.')
        }
    }

    async personalizeCaseStudy({ participant, baseText }) {
        const persona = [
            participant?.role ? `Role: ${participant.role}` : null,
            participant?.industry ? `Industry: ${participant.industry}` : null,
            participant?.teamSize ? `Team size: ${participant.teamSize}` : null
        ]
            .filter(Boolean)
            .join(', ')

        const prompt = `Rewrite the following leadership case study so it feels relevant to the participant.
Participant: ${persona || 'Role and industry not provided'}
Base case: "${baseText}"

Guidelines:
- Keep the meaning and structure of the original case.
- Adjust names, settings, or stakeholders so the scenario feels native to the participant context.
- Limit the response to 180 words.`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            return response.text()
        } catch (error) {
            console.error('Case study personalization failed:', error)
            throw new Error('Unable to personalize the case study right now.')
        }
    }

    async summarizeValuesResponse({ participant, teammatePlans, valuesInsights, responsePlaybook, practiceResponses }) {
        const payload = {
            participant,
            teammatePlans,
            valuesInsights,
            responsePlaybook,
            practiceResponses
        }

        const prompt = `You are reviewing a leadership learner's work on the "Values Response" challenge.
Context (JSON):
${JSON.stringify(payload)}

Return a JSON object with:
{
  "summary": "2-3 sentences acknowledging what they captured and what to watch for",
  "actionItems": ["bullet", "bullet"]
}
Keep the tone direct, professional, and oriented to next experiments.`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const data = extractJson(response.text())
            if (data) return data
            throw new Error('Invalid JSON from model')
        } catch (error) {
            console.error('Values response summary failed:', error)
            return {
                summary: 'The AI Coach could not generate a reflection right now.',
                actionItems: ['Try again in a few moments or continue with your own notes.']
            }
        }
    }

    async summarizeSelfReflection({ participant, result }) {
        const payload = {
            participant,
            result
        }

        const prompt = `You are reviewing the "Self vs. Others" reflection.
Context (JSON):
${JSON.stringify(payload)}

Return JSON:
{
  "summary": "1-2 sentences describing what their pattern means",
  "actionItems": ["next experiment", "next checkpoint"]
}`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const data = extractJson(response.text())
            if (data) return data
            throw new Error('Invalid JSON from model')
        } catch (error) {
            console.error('Self reflection summary failed:', error)
            return {
                summary: 'The AI Coach could not analyze the scores right now.',
                actionItems: ['Try again shortly or continue with your notes.']
            }
        }
    }

    async summarizeValuesRecognition({ participant, results }) {
        const payload = {
            participant,
            results
        }

        const prompt = `You are reviewing the "Values Recognition" challenge.
Context (JSON):
${JSON.stringify(payload)}

Return JSON:
{
  "summary": "1-2 sentences highlighting what the learner noticed across teammates",
  "actionItems": ["follow-up experiment", "follow-up check"]
}`

        try {
            const result = await this.model.generateContent(prompt)
            const response = await result.response
            const data = extractJson(response.text())
            if (data) return data
            throw new Error('Invalid JSON from model')
        } catch (error) {
            console.error('Values recognition summary failed:', error)
            return {
                summary: 'The AI Coach could not generate feedback right now.',
                actionItems: ['Re-run the request later or capture your own reflection.']
            }
        }
    }
}
