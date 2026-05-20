import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    base: process.env.VITE_BASE || '/',
    plugins: [vue()],
    server: {
        host: '0.0.0.0'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/styles/breakpoints.scss" as *;\n`
            }
        }
    },
    build: {
        target: 'es2020',
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-vue': ['vue', 'vue-router'],
                    'vendor-motion': ['gsap', '@vueuse/core'],
                    'vendor-fireworks': ['fireworks-js']
                }
            }
        }
    }
})
