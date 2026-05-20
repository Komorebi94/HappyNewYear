<template>
    <div
        ref="wrapperRef"
        class="birthday-wrapper"
        :class="{ 'is-reduced-motion': reducedMotion, 'is-celebrating': celebrated }"
        @click="onWrapperTap"
    >
        <div class="aurora-bg" aria-hidden="true" />
        <div class="glow-orb glow-orb--1" aria-hidden="true" />
        <div class="glow-orb glow-orb--2" aria-hidden="true" />

        <div class="balloons" aria-hidden="true">
            <span
                v-for="(balloon, i) in balloons"
                :key="i"
                class="balloon"
                :style="balloon.style"
            >{{ balloon.emoji }}</span>
        </div>

        <div v-if="showConfetti" class="confetti-layer" aria-hidden="true">
            <span
                v-for="piece in confettiPieces"
                :key="piece.id"
                class="confetti"
                :style="piece.style"
            />
        </div>

        <PageNav />

        <Transition name="flash">
            <div v-if="showFlash" class="flash-overlay" aria-hidden="true" />
        </Transition>

        <Transition name="fade">
            <p v-if="showFireworksHint" class="celebrate-hint">{{ hintText }}</p>
        </Transition>

        <ShareButton :params="shareParams" :initial-name="shareName" />

        <main class="birthday-stage">
            <p class="birthday-badge">✨ BIRTHDAY PARTY ✨</p>

            <div ref="messageBoxRef" class="birthday-card">
                <span class="cake" aria-hidden="true">🎂</span>
                <h1 class="birthday-title">
                    <span
                        v-for="(char, index) in titleChars"
                        :key="index"
                        class="title-char"
                        :ref="(el) => setTitleRef(el, index)"
                    >{{ char }}</span>
                </h1>
                <p class="birthday-sub">{{ subtitle }}</p>

                <div class="candles" aria-hidden="true">
                    <span
                        v-for="n in 5"
                        :key="n"
                        class="candle"
                        :class="{ lit: candlesLit }"
                    />
                </div>

                <button
                    v-if="!celebrated"
                    type="button"
                    class="celebrate-btn"
                    @click.stop="handleCelebrate"
                >
                    🕯️ 点燃蜡烛 · 开始庆祝
                </button>
            </div>
        </main>

        <Barrage
            v-if="showBarrage"
            :messages="barrageMessages"
            :density="barrageDensity"
            avoid-center
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import { getBarrageDensity } from '@/utils/index'
import { buildBirthdayTitle } from '@/utils/birthday'
import { useBirthdayQuery } from '@/composables/useBirthdayQuery'
import { useDevice } from '@/composables/useDevice'
import { useFireworks } from '@/composables/useFireworks'
import PageNav from '@/components/PageNav/index.vue'
import ShareButton from '@/components/ShareButton/index.vue'
import Barrage from '@/components/Barrage/index.vue'

const route = useRoute()
const { shareName, barrageMessages, autoCelebrate } = useBirthdayQuery()
const { deviceType, reducedMotion } = useDevice()

const wrapperRef = ref(null)
const messageBoxRef = ref(null)
const titleRefs = ref([])
const celebrated = ref(false)
const showBarrage = ref(false)
const showFlash = ref(false)
const showConfetti = ref(false)
const candlesLit = ref(false)
const confettiPieces = ref([])

const BALLOON_EMOJIS = ['🎈', '🎉', '🎊', '🎁', '💖', '🌟']

const balloons = Array.from({ length: 10 }, (_, i) => ({
    emoji: BALLOON_EMOJIS[i % BALLOON_EMOJIS.length],
    style: {
        left: `${8 + (i * 8.5) % 84}%`,
        animationDelay: `${i * 0.7}s`,
        animationDuration: `${5 + (i % 4)}s`
    }
}))

const {
    showFireworksHint,
    hintText,
    startFireworks,
    showHintTemporarily,
    onWrapperTap,
    destroy: destroyFireworks
} = useFireworks(wrapperRef, { deviceType, reducedMotion, theme: 'birthday' })

const titleChars = computed(() => buildBirthdayTitle(shareName.value))

const subtitle = computed(() => {
    if (shareName.value) return `愿所有美好都奔向你，${shareName.value}！`
    return '愿所有美好都如期而至'
})

const barrageDensity = computed(() =>
    getBarrageDensity(deviceType.value, reducedMotion.value)
)

const shareParams = computed(() => {
    const params = { page: 'birthday' }
    Object.entries(route.query).forEach(([key, value]) => {
        if (typeof value === 'string') params[key] = value
    })
    return params
})

let flashTimer = null

const setTitleRef = (el, index) => {
    if (el) titleRefs.value[index] = el
}

const spawnConfetti = () => {
    const colors = ['#ff6bcb', '#ffd166', '#a78bfa', '#60a5fa', '#34d399', '#fb7185']
    confettiPieces.value = Array.from({ length: 48 }, (_, i) => ({
        id: `c-${i}-${Date.now()}`,
        style: {
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${2.2 + Math.random() * 2}s`
        }
    }))
    showConfetti.value = true
}

const triggerFlash = () => {
    if (reducedMotion.value) return
    if (flashTimer) clearTimeout(flashTimer)
    showFlash.value = true
    flashTimer = setTimeout(() => {
        showFlash.value = false
        flashTimer = null
    }, 420)
}

const animateTitle = () => {
    nextTick(() => {
        const chars = titleRefs.value.filter(Boolean)
        if (!chars.length) return

        if (reducedMotion.value) {
            gsap.set(chars, { opacity: 1, y: 0, scale: 1 })
            return
        }

        gsap.fromTo(
            chars,
            { y: 36, opacity: 0, scale: 0.3 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.85,
                ease: 'back.out(2)',
                stagger: 0.06
            }
        )
    })
}

const animateCard = () => {
    if (!messageBoxRef.value || reducedMotion.value) return
    gsap.fromTo(
        messageBoxRef.value,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }
    )
}

const handleCelebrate = () => {
    if (celebrated.value) return
    celebrated.value = true
    candlesLit.value = true

    if (!reducedMotion.value && navigator.vibrate) {
        navigator.vibrate([60, 30, 80, 30, 120])
    }

    triggerFlash()
    spawnConfetti()
    startFireworks()
    showHintTemporarily()

    nextTick(() => {
        showBarrage.value = true
        animateTitle()
    })
}

onMounted(() => {
    animateCard()
    animateTitle()

    if (autoCelebrate.value) {
        setTimeout(() => {
            if (!celebrated.value) handleCelebrate()
        }, 1200)
    }
})

onUnmounted(() => {
    if (flashTimer) clearTimeout(flashTimer)
    destroyFireworks()
})
</script>

<style lang="scss" scoped>
.birthday-wrapper {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    overflow: hidden;
    background: #0a0612;
    touch-action: manipulation;
}

.aurora-bg {
    position: absolute;
    inset: -20%;
    background:
        radial-gradient(ellipse 60% 45% at 20% 30%, rgba(255, 107, 203, 0.35), transparent 55%),
        radial-gradient(ellipse 50% 40% at 80% 20%, rgba(167, 139, 250, 0.4), transparent 50%),
        radial-gradient(ellipse 55% 50% at 50% 90%, rgba(255, 209, 102, 0.25), transparent 55%),
        linear-gradient(160deg, #12081f 0%, #0a0612 45%, #1a0a2e 100%);
    animation: aurora-shift 12s ease-in-out infinite alternate;
}

@keyframes aurora-shift {
    from { transform: scale(1) rotate(0deg); }
    to { transform: scale(1.08) rotate(2deg); }
}

.glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    animation: orb-float 8s ease-in-out infinite alternate;

    &--1 {
        width: 280px;
        height: 280px;
        top: 10%;
        left: 5%;
        background: rgba(255, 107, 203, 0.35);
    }

    &--2 {
        width: 320px;
        height: 320px;
        bottom: 5%;
        right: 0;
        background: rgba(167, 139, 250, 0.3);
        animation-delay: -3s;
    }
}

@keyframes orb-float {
    from { transform: translate(0, 0); }
    to { transform: translate(24px, -18px); }
}

.balloons {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
}

.balloon {
    position: absolute;
    bottom: -15%;
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    animation-name: balloon-rise;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    filter: drop-shadow(0 4px 12px rgba(255, 107, 203, 0.4));
}

@keyframes balloon-rise {
    0% {
        transform: translateY(0) translateX(0) rotate(-6deg);
        opacity: 0;
    }
    12% { opacity: 1; }
    50% { transform: translateY(-55vh) translateX(12px) rotate(6deg); }
    100% {
        transform: translateY(-115vh) translateX(-8px) rotate(-4deg);
        opacity: 0.2;
    }
}

.confetti-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 10001;
    overflow: hidden;
}

.confetti {
    position: absolute;
    top: -12px;
    width: 8px;
    height: 14px;
    border-radius: 2px;
    animation-name: confetti-fall;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}

@keyframes confetti-fall {
    to {
        transform: translateY(110vh) rotate(720deg);
        opacity: 0.6;
    }
}

.birthday-stage {
    position: relative;
    z-index: 2;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding:
        calc(var(--safe-top) + 56px)
        1.25rem
        calc(var(--safe-bottom) + 24px);
}

.birthday-badge {
    margin-bottom: 1rem;
    font-size: 0.75rem;
    letter-spacing: 0.28em;
    color: rgba(255, 209, 102, 0.85);
    text-shadow: 0 0 20px rgba(255, 107, 203, 0.6);
}

.birthday-card {
    position: relative;
    width: min(92vw, 520px);
    padding: 2rem 1.5rem 1.75rem;
    text-align: center;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(14px);
    box-shadow:
        0 0 60px rgba(255, 107, 203, 0.25),
        0 0 120px rgba(167, 139, 250, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.cake {
    display: block;
    font-size: 3rem;
    margin-bottom: 0.5rem;
    animation: cake-bounce 2s ease-in-out infinite;
}

@keyframes cake-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-8px) scale(1.05); }
}

.birthday-title {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.05em;
    font-size: clamp(2rem, 8vw, 3.25rem);
    font-weight: 800;
    line-height: 1.2;
    background: linear-gradient(120deg, #ffd166 0%, #ff6bcb 45%, #c4b5fd 80%, #60a5fa 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: title-shine 4s linear infinite;
    filter: drop-shadow(0 0 24px rgba(255, 107, 203, 0.45));
}

@keyframes title-shine {
    to { background-position: 200% center; }
}

.title-char {
    display: inline-block;
}

.birthday-sub {
    margin-top: 0.85rem;
    font-size: clamp(0.9rem, 3.5vw, 1.1rem);
    color: rgba(255, 255, 255, 0.78);
    letter-spacing: 0.04em;
}

.candles {
    display: flex;
    justify-content: center;
    gap: 0.65rem;
    margin: 1.25rem 0 1rem;
    height: 2.5rem;
    align-items: flex-end;
}

.candle {
    width: 10px;
    height: 1.75rem;
    border-radius: 4px 4px 2px 2px;
    background: linear-gradient(180deg, #ff9ecd 0%, #ff6bcb 100%);
    position: relative;
    opacity: 0.45;
    transition: opacity 0.4s ease;

    &::after {
        content: '';
        position: absolute;
        top: -10px;
        left: 50%;
        width: 8px;
        height: 10px;
        margin-left: -4px;
        border-radius: 50% 50% 20% 20%;
        background: transparent;
        transform: scale(0);
        transition: transform 0.35s ease, background 0.35s ease;
    }

    &.lit {
        opacity: 1;

        &::after {
            transform: scale(1);
            background: radial-gradient(circle, #fff9c4 0%, #ffd166 40%, #ff6b35 100%);
            animation: flame-flicker 0.5s ease-in-out infinite alternate;
        }
    }
}

@keyframes flame-flicker {
    from { transform: scale(1) translateY(0); }
    to { transform: scale(1.15) translateY(-2px); }
}

.celebrate-btn {
    margin-top: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 999px;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1a0a2e;
    cursor: pointer;
    background: linear-gradient(135deg, #ffd166 0%, #ff6bcb 50%, #c4b5fd 100%);
    box-shadow: 0 4px 24px rgba(255, 107, 203, 0.45);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 8px 32px rgba(255, 107, 203, 0.55);
    }

    &:focus-visible {
        outline: 2px solid #ffd166;
        outline-offset: 3px;
    }
}

.flash-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 220, 240, 0.65);
    z-index: 9998;
    pointer-events: none;
}

.flash-enter-active,
.flash-leave-active {
    transition: opacity 0.42s ease;
}

.flash-enter-from,
.flash-leave-to {
    opacity: 0;
}

.celebrate-hint {
    position: fixed;
    bottom: calc(var(--safe-bottom) + 24px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 10001;
    padding: 10px 18px;
    border-radius: 999px;
    background: rgba(20, 10, 30, 0.65);
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.875rem;
    white-space: nowrap;
    pointer-events: none;
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 107, 203, 0.35);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

.is-reduced-motion {
    .aurora-bg,
    .glow-orb,
    .balloon,
    .cake,
    .birthday-title {
        animation: none;
    }

    .confetti-layer {
        display: none;
    }
}

@media (prefers-reduced-motion: reduce) {
    .flash-enter-active,
    .flash-leave-active,
    .fade-enter-active,
    .fade-leave-active {
        transition-duration: 0.01ms;
    }
}
</style>
