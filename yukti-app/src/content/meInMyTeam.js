const CONTENT_BASE = '/content/me-in-my-team'

const manifest = [
    {
        id: 'reflection',
        file: 'challenge1_self_vs_others.json'
    },
    {
        id: 'values-recognition',
        file: 'challenge2_values_recognition.json'
    },
    {
        id: 'values-response',
        file: 'challenge3_values_response.json'
    }
]

let cachedChallenges = null

async function fetchJson(path) {
    const response = await fetch(path)
    if (!response.ok) {
        throw new Error(`Failed to load ${path}`)
    }
    return response.json()
}

function buildConcept(panel, fallbackTitle) {
    if (!panel) {
        return {
            title: fallbackTitle,
            description: '',
            asset: '',
            caption: ''
        }
    }

    return {
        title: fallbackTitle,
        description: panel.callout || panel.highlightStrategy || '',
        asset: panel.asset ? `${CONTENT_BASE}/${panel.asset}` : '',
        caption: panel.caption || ''
    }
}

function normalizeChallenge(id, data) {
    return {
        id,
        title: data.title,
        description: data.summary,
        concept: buildConcept(data.conceptPanel, data.title),
        data
    }
}

export async function loadMeInMyTeamChallenges() {
    if (cachedChallenges) {
        return cachedChallenges
    }

    const responses = await Promise.all(
        manifest.map(entry => fetchJson(`${CONTENT_BASE}/${entry.file}`))
    )

    cachedChallenges = responses.map((data, index) =>
        normalizeChallenge(manifest[index].id, data)
    )

    return cachedChallenges
}

export async function getChallengeConfig(id) {
    const challenges = await loadMeInMyTeamChallenges()
    return challenges.find(challenge => challenge.id === id)
}
