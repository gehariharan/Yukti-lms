export class GroqService {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://api.groq.com/openai/v1'
  }

  async generateOnboardingResponse(context) {
    const { participantData, conversationHistory } = context

    const systemPrompt = `You are Aaroha, a warm and insightful leadership coach guiding learners through their onboarding experience on Yukti, a leadership learning platform.

Your role:
- Ask thoughtful, conversational questions to understand the learner's context
- Be concise but engaging (2-3 sentences per response)
- Use the learner's name naturally in conversation
- Reflect back what you hear to show understanding
- Build excitement about their learning journey

Current learner context:
${participantData.name ? `Name: ${participantData.name}` : 'Name: Not provided yet'}
${participantData.role ? `Role: ${participantData.role}` : 'Role: Not provided yet'}
${participantData.industry ? `Industry: ${participantData.industry}` : 'Industry: Not provided yet'}
${participantData.teamSize ? `Team Size: ${participantData.teamSize}` : 'Team Size: Not provided yet'}

Guidelines:
- Keep responses under 50 words
- Be natural and human, not robotic
- Show genuine interest in their context
- Use markdown for emphasis (**bold**)
`

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'coach' ? 'assistant' : 'user',
        content: msg.content
      }))
    ]

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          max_tokens: 150,
          top_p: 1
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || "I'm here to help. What would you like to share?"
    } catch (error) {
      console.error('Groq API error:', error)
      throw new Error('Failed to generate response from Groq API')
    }
  }

  async generateChallengeResponse(context) {
    const { challengeId, participantData, userResponse, previousContext } = context

    const systemPrompt = `You are Aaroha, an expert leadership coach providing personalized insights on the Yukti learning platform.

Challenge: ${challengeId}
Participant: ${participantData.name} (${participantData.role} in ${participantData.industry})

Provide:
- Thoughtful reflection on their response
- 2-3 actionable insights
- Keep it concise (under 100 words)
- Use markdown for structure
`

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `My response: ${userResponse}` }
    ]

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          max_tokens: 300,
          top_p: 1
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ""
    } catch (error) {
      console.error('Groq API error:', error)
      throw new Error('Failed to generate challenge response')
    }
  }

  async generateCoachingResponse(context) {
    const { participantData, conversationHistory, userMessage } = context

    // ============================================
    // SYSTEM PROMPT - Update this section to customize Aaroha's coaching behavior
    // ============================================
    const systemPrompt = `You are Aaroha, a warm and insightful leadership coach on the Yukti learning platform.

Participant Context:
- Name: ${participantData.name || 'there'}
- Role: ${participantData.role || 'Not specified'}
- Industry: ${participantData.industry || 'Not specified'}
- Team Size: ${participantData.teamSize || 'Not specified'}

Your coaching style:
- Ask powerful questions that encourage reflection
- Provide actionable insights grounded in their context
- Be empathetic and supportive
- Keep responses conversational and under 100 words
- Use markdown for emphasis (**bold**)
- Reference their role and industry when relevant

You help leaders with:
- Choosing appropriate learning tracks
- Working through real leadership challenges
- Reflecting on their growth journey
- Building self-awareness and skills
`
    // ============================================
    // End of System Prompt
    // ============================================

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
        .filter(msg => msg.type !== 'coach' || conversationHistory.indexOf(msg) > 0) // Skip initial welcome
        .map(msg => ({
          role: msg.type === 'coach' ? 'assistant' : 'user',
          content: msg.content
        }))
    ]

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.8,
          max_tokens: 250,
          top_p: 1
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || "I'm here to help. Could you tell me more?"
    } catch (error) {
      console.error('Groq API error:', error)
      throw new Error('Failed to generate coaching response')
    }
  }
}
