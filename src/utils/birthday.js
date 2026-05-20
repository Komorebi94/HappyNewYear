import { sanitizeShareName } from '@/utils/index'

export const DEFAULT_BIRTHDAY_MESSAGES = [
    '生日快乐！',
    'Happy Birthday!',
    '🎂 岁岁平安',
    '🎈 心想事成',
    '✨ 永远开心',
    '🎁 万事顺意',
    '🌟 前程似锦',
    '💝 笑口常开'
]

export const buildBirthdayTitle = (name) => {
    const safe = sanitizeShareName(name)
    if (!safe) return ['生', '日', '快', '乐']
    return [...`${safe}，生日快乐`.split('')]
}

export const buildBirthdayBarrage = (name, baseMessages = DEFAULT_BIRTHDAY_MESSAGES) => {
    const safe = sanitizeShareName(name)
    if (!safe) return [...baseMessages]
    return [
        `${safe}，生日快乐！`,
        `祝${safe}生日快乐`,
        `${safe}，Happy Birthday!`,
        ...baseMessages
    ]
}
