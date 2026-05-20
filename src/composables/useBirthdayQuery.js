import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { sanitizeShareName } from '@/utils/index'
import { DEFAULT_BIRTHDAY_MESSAGES, buildBirthdayBarrage } from '@/utils/birthday'

export function useBirthdayQuery () {
    const route = useRoute()

    const shareName = computed(() => {
        const raw = route.query.name
        if (typeof raw !== 'string') return ''
        return sanitizeShareName(raw)
    })

    const barrageMessages = computed(() => {
        const raw = route.query.messages
        const base =
            typeof raw === 'string' && raw.trim()
                ? raw.split(',').map((s) => s.trim()).filter(Boolean)
                : [...DEFAULT_BIRTHDAY_MESSAGES]
        return buildBirthdayBarrage(shareName.value, base)
    })

    const autoCelebrate = computed(() => route.query.auto !== 'false')

    return {
        shareName,
        barrageMessages,
        autoCelebrate
    }
}
