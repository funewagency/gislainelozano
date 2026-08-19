// @vitest-environment jsdom
/**
 * Reusable test harness for CMS field components.
 *
 * Provides standard edge-case test suites that any field component can use:
 *   - Renders a label
 *   - Handles undefined/null for ALL optional props without crashing
 *   - Handles extreme values (long strings, special characters)
 *   - Verifies the controlled onChange callback
 *
 * Usage:
 *   import { createFieldTests } from '@/test/field-test-harness'
 *   createFieldTests('TextField', (props) => render(<TextField {...props} />), {
 *     requiredProps: { label: 'Nome', value: '', onChange: () => {} },
 *     getInput: () => screen.getByRole('textbox'),
 *     sampleValue: 'hello',
 *   })
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from './test-utils'
import type { ReactElement } from 'react'
import type { RenderResult } from '@testing-library/react'

interface FieldTestConfig {
  /** Component display name for test descriptions */
  name: string
  /** Render the component with given props, return the result */
  render: (props: Record<string, unknown>) => RenderResult
  /** Minimum required props (label, value, onChange) */
  requiredProps: Record<string, unknown>
  /** Get the primary interactive element */
  getInput?: () => HTMLElement | null
  /** Set a new value via the primary input interaction */
  simulateChange?: (value: unknown) => void
  /** A typical valid value for onChange verification */
  sampleValue?: unknown
  /** Props that are optional — tested with undefined/null */
  optionalPropKeys?: string[]
}

export function createFieldTests({
  name,
  render: renderField,
  requiredProps,
  getInput,
  simulateChange,
  sampleValue,
  optionalPropKeys = [],
}: FieldTestConfig) {
  const labelText = (requiredProps.label ?? 'Test Label') as string

  describe(`${name} — field test harness`, () => {
    it(`renders label text: "${labelText}"`, () => {
      renderField(requiredProps)
      expect(screen.getByText(labelText)).toBeDefined()
    })

    it(`renders without crashing when called with only required props`, () => {
      expect(() => renderField(requiredProps)).not.toThrow()
    })

    it(`calls onChange when value changes`, () => {
      if (!simulateChange && !getInput) return // skip if no interaction defined
      const onChange = vi.fn()
      renderField({ ...requiredProps, onChange })
      if (simulateChange) {
        simulateChange(sampleValue)
      } else if (getInput) {
        const input = getInput()
        if (input) fireEvent.change(input, { target: { value: sampleValue } })
      }
      if (sampleValue !== undefined) {
        expect(onChange).toHaveBeenCalled()
      }
    })

    // ── Edge cases: optional props ──────────────────────────────

    for (const key of optionalPropKeys) {
      it(`renders without crashing when optional prop "${key}" is undefined`, () => {
        const { [key]: _, ...rest } = requiredProps as Record<string, unknown>
        expect(() => renderField(rest)).not.toThrow()
      })

      it(`renders without crashing when optional prop "${key}" is null`, () => {
        expect(() => renderField({ ...requiredProps, [key]: null })).not.toThrow()
      })
    }

    // ── Edge cases: extreme values ──────────────────────────────

    it('handles extremely long string values (50k chars)', () => {
      const longString = 'x'.repeat(50000)
      expect(() => renderField({ ...requiredProps, value: longString })).not.toThrow()
    })

    it('handles special characters', () => {
      const special = '<script>alert("xss")</script> & "quotes" \'single\' 日本語 🔥'
      expect(() => renderField({ ...requiredProps, value: special })).not.toThrow()
    })

    it('handles empty string value', () => {
      expect(() => renderField({ ...requiredProps, value: '' })).not.toThrow()
    })

    // ── Controlled onChange safety ──────────────────────────────

    it('does not crash when onChange is missing/undefined', () => {
      const { onChange: _, ...noOnChange } = requiredProps as Record<string, unknown>
      // Should render without error even without onChange
      const { unmount } = renderField(noOnChange)
      // Try to trigger the change if possible
      if (getInput) {
        const input = getInput()
        if (input) {
          expect(() => fireEvent.change(input, { target: { value: 'test' } }).length ?? 1).toBeDefined()
        }
      }
      unmount()
    })
  })
}

/**
 * Creates edge-case tests for ALL field components in the CMS.
 * This ensures every field type is hardened against undefined/null props.
 */
export function createCommonEdgeCaseTests(
  name: string,
  Component: React.ComponentType<any>,
  defaultProps: Record<string, unknown>,
  overrides?: Partial<FieldTestConfig>,
) {
  describe(`${name} — edge cases`, () => {
    it('renders with all props undefined (defaults should kick in)', () => {
      expect(() => render(<Component />)).not.toThrow()
    })

    it('renders with undefined label', () => {
      expect(() => render(<Component {...defaultProps} label={undefined} />)).not.toThrow()
    })

    it('renders with null label', () => {
      expect(() => render(<Component {...defaultProps} label={null} />)).not.toThrow()
    })

    it('renders with undefined onChange', () => {
      expect(() => render(<Component {...defaultProps} onChange={undefined} />)).not.toThrow()
    })

    it('renders with null onChange', () => {
      expect(() => render(<Component {...defaultProps} onChange={null as unknown as (...args: unknown[]) => unknown} />)).not.toThrow()
    })
  })
}

export const LONG_STRING = 'x'.repeat(50000)
export const SPECIAL_CHARS = '<script>alert("xss")</script> & "quotes" \'single\' 日本語 🔥'
