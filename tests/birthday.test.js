import { describe, it, expect } from 'vitest'
import { buildBirthdayTitle, buildBirthdayBarrage } from '../src/utils/birthday.js'

describe('buildBirthdayTitle', () => {
    it('returns default title without name', () => {
        expect(buildBirthdayTitle('')).toEqual(['生', '日', '快', '乐'])
    })

    it('includes name', () => {
        const title = buildBirthdayTitle('小明')
        expect(title.join('')).toBe('小明，生日快乐')
    })
})

describe('buildBirthdayBarrage', () => {
    it('prepends personalized messages', () => {
        const list = buildBirthdayBarrage('小红', ['生日快乐'])
        expect(list[0]).toBe('小红，生日快乐！')
        expect(list).toContain('生日快乐')
    })
})
