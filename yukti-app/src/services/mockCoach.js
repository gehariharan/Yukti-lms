export class MockCoachService {
    async personalizeCaseStudy({ participant, baseText }) {
        const role = participant?.role || 'leader'
        const industry = participant?.industry || 'your industry'
        return `You are a ${role} in ${industry}. ${baseText}`
    }

    async summarizeSelfReflection({ result }) {
        const anchor = result?.interpretation?.label || 'Balanced'
        return {
            summary: `Your pattern points to a ${anchor} stance. Notice when this helps the team and when it might over-correct.`,
            actionItems: [
                'Pick one meeting this week to intentionally tilt toward the opposite side.',
                'Ask a trusted teammate for a quick read on how your stance lands.'
            ]
        }
    }

    async summarizeValuesRecognition({ results = [] }) {
        const names = results.map(r => r.name).filter(Boolean)
        const focus = names.length ? names.join(' and ') : 'your teammates'
        return {
            summary: `You mapped ${focus} to clear value signals. Use those cues to tailor the next check-in.`,
            actionItems: [
                'Validate one assumption with a quick conversation.',
                'Spot one watchout behaviour and design a support move around it.'
            ]
        }
    }

    async summarizeValuesResponse({ teammatePlans }) {
        const names = Object.values(teammatePlans || {})
            .map(plan => plan.name)
            .filter(Boolean)
        const focus = names.length ? names.join(' and ') : 'your teammates'

        return {
            summary: `Nice work translating the values insights into responses for ${focus}. Keep pairing your support notes with concrete challenges so the habit sticks.`,
            actionItems: [
                'Pick one behaviour per teammate to practise this week and note what you observe.',
                'Share the case-study reflections with a peer coach for accountability.'
            ]
        }
    }
}
