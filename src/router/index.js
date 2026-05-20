import { createRouter, createWebHistory } from 'vue-router'

// 定义路由规则
const routes = [
    {
        path: '/',
        name: 'HappyNewYear',
        component: () => import('@/views/HappyNewYear/index.vue')
    }
]

// 创建路由实例（GitHub Pages 子路径需与 vite.config base 一致）
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE),
    routes
})

export default router
