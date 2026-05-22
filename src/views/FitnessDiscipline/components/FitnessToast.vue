<template>
    <Transition name="toast">
        <div v-if="message" class="fitness-toast" role="status">
            {{ message }}
        </div>
    </Transition>
</template>

<script setup>
defineProps({
    message: { type: String, default: '' }
})
</script>

<style scoped lang="scss">
.fitness-toast {
    position: fixed;
    left: 50%;
    bottom: calc(5.5rem + var(--safe-bottom));
    z-index: 200;
    max-width: calc(100% - 2rem);
    padding: 0.75rem 1.25rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.92);
    color: #f8fafc;
    font-size: 0.875rem;
    line-height: 1.4;
    text-align: center;
    transform: translateX(-50%);
    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.25);
    backdrop-filter: blur(8px);
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
}
</style>
