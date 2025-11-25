import { createRouter, createWebHistory } from 'vue-router'
import OnboardingView from '../views/OnboardingView.vue'
import TracksView from '../views/TracksView.vue'
import MeInMyTeamView from '../views/MeInMyTeamView.vue'
import CoachChatView from '../views/CoachChatView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'onboarding',
            component: OnboardingView
        },
        {
            path: '/tracks',
            name: 'tracks',
            component: TracksView
        },
        {
            path: '/coach',
            name: 'coach',
            component: CoachChatView
        },
        {
            path: '/tracks/me-in-my-team/:challengeId?',
            name: 'meInMyTeam',
            component: MeInMyTeamView
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

export default router
