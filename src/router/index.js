import { createRouter, createWebHistory } from 'vue-router'
import { resolveAppBase } from '@/utils/resolveAppBase'
import HappyNewYear from '@/views/HappyNewYear/index.vue'

const routes = [
    {
        path: '/',
        name: 'HappyNewYear',
        component: HappyNewYear
    }
]

const router = createRouter({
    history: createWebHistory(resolveAppBase()),
    routes
})

export default router
