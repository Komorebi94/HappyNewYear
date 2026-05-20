<template>
    <div class="barrage-wrapper" :aria-hidden="!reducedMotion">
        <!-- 减弱动效：底部静态轮播 -->
        <p
            v-if="reducedMotion && staticText"
            class="barrage-static"
            aria-live="polite"
        >{{ staticText }}</p>

        <template v-else>
            <span
                v-for="item in items"
                :key="item.id"
                class="barrage-item"
                :class="`barrage-item--${density}`"
                :style="item.style"
            >{{ item.text }}</span>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { prefersReducedMotion } from '@/utils/index'

const props = defineProps({
    messages: {
        type: Array,
        default: () => [
            '新年快乐！',
            'Happy New Year!',
            '🎉 万事如意',
            '🎊 心想事成',
            '✨ 阖家幸福',
            '🧧 大吉大利',
            '🎆 岁岁平安',
            '🌟 前程似锦',
            '💫 龙马精神',
            '🎇 财源广进'
        ]
    },
    density: {
        type: String,
        default: 'medium',
        validator: (v) => ['low', 'medium', 'high'].includes(v)
    },
    avoidCenter: {
        type: Boolean,
        default: true
    }
})

const DENSITY_CONFIG = {
    low: { interval: 1500, maxItems: 20, burst: 1, stagger: 0 },
    medium: { interval: 1000, maxItems: 32, burst: 1, stagger: 0 },
    high: { interval: 750, maxItems: 45, burst: 2, stagger: 500 }
}

/** 固定轨道（%），上下分区避让中部祝福语 */
const UPPER_LANES = [8, 13, 18, 23, 28]
const LOWER_LANES = [72, 77, 82, 87, 92]
const FULL_LANES = [10, 18, 26, 34, 42, 50, 58, 66, 74, 82]

const MIN_LANE_GAP = 6
let laneCursor = 0

const reducedMotion = ref(prefersReducedMotion())
const items = ref([])
const staticText = ref('')
let spawnTimer = null
let staticTimer = null
let motionMediaQuery = null

const config = computed(() => DENSITY_CONFIG[props.density] || DENSITY_CONFIG.medium)

const clearSpawnTimer = () => {
    if (spawnTimer) {
        clearInterval(spawnTimer)
        spawnTimer = null
    }
}

const clearStaticTimer = () => {
    if (staticTimer) {
        clearInterval(staticTimer)
        staticTimer = null
    }
}

const removeItem = (id) => {
    items.value = items.value.filter((item) => item.id !== id)
}

const getLanePool = () => {
    if (!props.avoidCenter) return FULL_LANES
    return [...UPPER_LANES, ...LOWER_LANES]
}

/** 按轨道轮询 + 最小间距，减少同高度扎堆 */
const pickDispersedTop = () => {
    const pool = getLanePool()
    const activeTops = items.value.map((item) => parseFloat(item.style.top))

    for (let i = 0; i < pool.length; i++) {
        const lane = pool[(laneCursor + i) % pool.length]
        const crowded = activeTops.some((t) => Math.abs(t - lane) < MIN_LANE_GAP)
        if (!crowded) {
            laneCursor = (laneCursor + i + 1) % pool.length
            return lane + (Math.random() - 0.5) * 2
        }
    }

    let bestLane = pool[0]
    let fewestNeighbors = Infinity
    for (const lane of pool) {
        const neighbors = activeTops.filter((t) => Math.abs(t - lane) < MIN_LANE_GAP * 2).length
        if (neighbors < fewestNeighbors) {
            fewestNeighbors = neighbors
            bestLane = lane
        }
    }
    laneCursor = (pool.indexOf(bestLane) + 1) % pool.length
    return bestLane + (Math.random() - 0.5) * 3
}

const pickMessage = () => {
    const recent = items.value.slice(-4).map((item) => item.text)
    let text = props.messages[Math.floor(Math.random() * props.messages.length)]
    let guard = 0
    while (recent.includes(text) && guard < 6) {
        text = props.messages[Math.floor(Math.random() * props.messages.length)]
        guard += 1
    }
    return text
}

const spawnOne = () => {
    if (items.value.length >= config.value.maxItems) return

    const text = pickMessage()
    const id = `${Date.now()}-${Math.random()}`
    const top = pickDispersedTop()
    const duration = 10 + Math.random() * 8
    const delay = -(Math.random() * 6)

    items.value.push({
        id,
        text,
        style: {
            top: `${top}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`
        }
    })

    const visibleMs = (duration + Math.max(0, -delay)) * 1000 + 200
    setTimeout(() => removeItem(id), visibleMs)
}

const spawn = () => {
    const { burst = 1, stagger = 0 } = config.value
    for (let i = 0; i < burst; i++) {
        setTimeout(() => spawnOne(), i * stagger)
    }
}

const startScrolling = () => {
    clearSpawnTimer()
    items.value = []
    laneCursor = 0
    spawn()
    spawnTimer = setInterval(spawn, config.value.interval)
}

const startStaticCarousel = () => {
    clearStaticTimer()
    clearSpawnTimer()
    items.value = []

    const rotate = () => {
        staticText.value = pickMessage()
    }
    rotate()
    staticTimer = setInterval(rotate, 3500)
}

const restart = () => {
    if (reducedMotion.value) {
        startStaticCarousel()
    } else {
        startScrolling()
    }
}

watch(() => props.density, () => {
    if (!reducedMotion.value) restart()
})

watch(() => props.messages, () => {
    restart()
}, { deep: true })

const onMotionChange = (event) => {
    reducedMotion.value = event.matches
    restart()
}

onMounted(() => {
    motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = motionMediaQuery.matches
    motionMediaQuery.addEventListener('change', onMotionChange)
    restart()
})

onUnmounted(() => {
    motionMediaQuery?.removeEventListener('change', onMotionChange)
    clearSpawnTimer()
    clearStaticTimer()
})
</script>

<style lang="scss" scoped>
.barrage-wrapper {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 10000;
}

.barrage-static {
    position: fixed;
    bottom: calc(var(--safe-bottom) + 20px);
    left: 50%;
    transform: translateX(-50%);
    max-width: 90vw;
    padding: 10px 18px;
    border-radius: 999px;
    background: var(--glass-bg);
    color: #fff;
    font-size: 1rem;
    text-align: center;
    backdrop-filter: blur(6px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.barrage-item {
    position: absolute;
    left: 0;
    white-space: nowrap;
    color: #fff;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
    animation-name: barrage-scroll;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    will-change: transform;

    &--low {
        font-size: 0.875rem;
    }

    &--medium {
        font-size: 1rem;
    }

    &--high {
        font-size: 1.125rem;
    }
}

/* 终点用 vw + 自身宽度，避免短文案只移动 -120% 宽度就结束 */
@keyframes barrage-scroll {
    from {
        transform: translateX(100vw);
    }
    to {
        transform: translateX(calc(-100% - 2rem));
    }
}

@media (prefers-reduced-motion: reduce) {
    .barrage-item {
        animation: none;
        opacity: 0;
    }
}
</style>
