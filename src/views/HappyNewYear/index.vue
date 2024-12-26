<template>
    <div class="happy-new-year-wrapper">
        <template v-if="!onlyShowFireWorks">
            <div class="countdown">
                <!-- 全屏倒计时动画 -->
                <div v-if="isFinalCountdown" class="fullscreen-countdown" :class="{ mobile: isMobile_ }">
                    <h1 ref="countdownNumber">{{ finalSeconds }}</h1>
                </div>
                <!-- 常规倒计时 -->
                <div v-if="!isFinalCountdown && !isTimeUp" class="countdown" :class="{ mobile: isMobile_ }">
                    距离新年还有：<br v-if="isMobile_">
                    {{ formatNumber(countdown.days) }} 天 {{ formatNumber(countdown.hours) }} 小时
                    {{ formatNumber(countdown.minutes) }} 分钟 {{ formatNumber(countdown.seconds) }} 秒
                </div>

                <div v-if="isTimeUp" class="new-year-message">
                    <span v-for="(char, index) in newYearMessage" :key="index" class="char" :ref="`char${index}`">{{
                        char }}</span>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import Fireworks from 'fireworks-js'
import { isMobile } from '@/utils/index'
import Barrage from '@/components/Barrage/index.vue'


const isMobile_ = isMobile();
const { onlyShowFireWorks, testEffect } = useRoute().query

const showBarrage = ref(false);

// 🕒 倒计时目标时间（自定义）
const currentYear = new Date().getFullYear()
let targetDate = ref(`${currentYear + 1}-01-01 00:00:00`) // 动态的计算年份
if (testEffect === 'true') {
    // 当前时间加 15 秒，用于测试
    targetDate = ref(new Date(new Date().getTime() + 15 * 1000))
}

// 倒计时数据
const countdown = ref({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
})

// 最后10秒倒计时状态
const isFinalCountdown = ref(false)
const finalSeconds = ref(10)

// 是否倒计时结束
const isTimeUp = ref(false)

// 🎆 烟花效果
const startFireworks = () => {
    const container = document.querySelector('.happy-new-year-wrapper')
    const fireworks = new Fireworks(container, {
        // 自动调整尺寸
        autoresize: true,

        // 粒子透明度
        opacity: 0.5,

        // 粒子加速度
        acceleration: 1.05,

        // 粒子摩擦力
        friction: 0.97,

        // 重力加速度
        gravity: 1.5,

        // 粒子数量
        particles: 50,

        // 粒子尾迹长度
        traceLength: 3,

        // 粒子尾迹速度
        traceSpeed: 10,

        // 爆炸半径
        explosion: 5,

        // 粒子强度
        intensity: 30,

        // 粒子闪烁频率
        flickering: 50,

        // 粒子线条样式
        lineStyle: 'round',

        // 颜色范围
        hue: {
            min: 0,
            max: 360
        },

        // 粒子延迟时间
        delay: {
            min: 30,
            max: 60
        },

        // 火箭发射点
        rocketsPoint: {
            min: 50,
            max: 50
        },

        // 粒子线条宽度
        lineWidth: {
            // 爆炸的粒子线条宽度
            explosion: {
                min: 1,
                max: 3
            },
            // 尾迹的粒子线条宽度
            trace: {
                min: 1,
                max: 2
            }
        },

        // 粒子亮度
        brightness: {
            min: 50,
            max: 80
        },

        // 粒子衰减速度
        decay: {
            min: 0.015,
            max: 0.03
        },

        // 鼠标交互
        mouse: {
            // 点击
            click: false,

            // 移动
            move: false,

            // 最大粒子数
            max: 1
        }
    })
    fireworks.start()
}

// 📅 更新常规倒计时
const updateCountdown = () => {
    const now = new Date()
    const target = new Date(targetDate.value)
    const timeDifference = target - now

    if (timeDifference <= 0) {
        isTimeUp.value = true
        return
    }

    const seconds = Math.floor((timeDifference / 1000) % 60)
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60)
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24)
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

    countdown.value = { days, hours, minutes, seconds }

    // 进入最后10秒倒计时
    if (days === 0 && hours === 0 && minutes === 0 && seconds <= 10) {
        if (!isFinalCountdown.value) {
            isFinalCountdown.value = true
            finalSeconds.value = seconds
            startFinalCountdown()
        }
    }
}

// 🎥 最后10秒倒计时动画
const countdownNumber = ref(null)

const startFinalCountdown = () => {
    const timer = setInterval(() => {
        if (finalSeconds.value > 1) {
            finalSeconds.value -= 1
            animateFinalCountdown()
        } else {
            clearInterval(timer)
            isTimeUp.value = true
            isFinalCountdown.value = false
            startFireworks();
            nextTick(() => {
                showBarrage.value = true;
                startNewYearAnimation()
            })
        }
    }, 1000)
}

// 🎬 使用 GSAP 动画
const animateFinalCountdown = () => {
    nextTick(() => {
        gsap.fromTo(
            countdownNumber.value,
            { scale: 2, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.9,
                ease: 'bounce.out'
            }
        )
    })
}

// 🔢 格式化数字为两位数
const formatNumber = (number) => {
    return number.toString().padStart(2, '0')
}

// 🎉 新年快乐动画
const newYearMessage = ref(['🎉 ','新', '年', '快', '乐',' 🎉']) // 动态数据源

const startNewYearAnimation = () => {
    const chars = newYearMessage.value.map((_, index) => {
        return document.querySelector(`.char:nth-child(${index + 1})`)
    })

    gsap.fromTo(
        chars,
        { y: -200, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'bounce.out',
            stagger: 0.5
        }
    )
}


// 🔄 初始化倒计时
onMounted(() => {
    if (onlyShowFireWorks === 'true' && !testEffect) {
        startFireworks()
        return;
    }
    updateCountdown()
    setInterval(updateCountdown, 1000)
})
</script>

<style lang="scss" scoped>
.happy-new-year-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #000;

    .countdown {
        color: #00FF00;
        font-size: 1rem;
        text-align: center;
        font-family: Arial, sans-serif;
        white-space: pre-line;
        position: fixed;
        width: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .countdown.mobile {
        font-size: 1.5rem;
    }

    /* 🌟 全屏倒计时样式 */
    .fullscreen-countdown {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        color: #D8B3D3;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 3rem;
        font-weight: bold;
        z-index: 9999;

        &.mobile {
            font-size: 8rem;
        }
    }

    /* 🎉 倒计时结束消息 */
    .new-year-message {
        margin-top: 20px;
        font-size: 1.8rem;
        color: #42b983;
        font-weight: bold;
    }
}
</style>