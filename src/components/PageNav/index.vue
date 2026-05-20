<template>
    <nav class="page-nav" aria-label="页面导航">
        <router-link
            class="page-nav__link"
            :class="{ 'is-active': route.name === 'HappyNewYear' }"
            to="/"
        >跨年倒计时</router-link>
        <router-link
            class="page-nav__link"
            :class="{ 'is-active': route.name === 'Birthday' }"
            to="/birthday"
        >生日祝福</router-link>
    </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style lang="scss" scoped>
.page-nav {
    position: fixed;
    top: calc(var(--safe-top) + 12px);
    left: calc(var(--safe-left) + 12px);
    z-index: 10003;
    display: flex;
    gap: 6px;
    padding: 4px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
}

.page-nav__link {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    transition: color 0.2s ease, background 0.2s ease;

    &:hover {
        color: #fff;
    }

    &.is-active {
        color: #fff;
        background: rgba(255, 255, 255, 0.14);
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
}
</style>
