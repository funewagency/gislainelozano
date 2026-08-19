import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes via object syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })

  it('handles conditional classes via array syntax', () => {
    expect(cn('base', ['foo', 'bar'])).toBe('base foo bar')
  })

  it('filters falsy values', () => {
    expect(cn('foo', false, null, undefined, 0, 'bar')).toBe('foo bar')
  })

  it('handles tailwind conflicts via twMerge (later wins)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-700')).toBe('text-blue-700')
  })

  it('preserves non-conflicting classes', () => {
    expect(cn('font-bold', 'text-center', 'py-2')).toBe('font-bold text-center py-2')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles single class input', () => {
    expect(cn('hello')).toBe('hello')
  })

  it('handles tailwind prefix conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('m-1', 'm-4')).toBe('m-4')
  })
})
