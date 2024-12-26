import { createRouter, createWebHistory } from 'vue-router'

// 定义路由规则
const routes = [
    {
        path: '/',
        name: 'HappyNewYear',
        component: () => import('@/views/HappyNewYear/index.vue')
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
