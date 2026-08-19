// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { StepIndicator } from './step-indicator'

describe('StepIndicator', () => {
  it('renders all steps', () => {
    render(<StepIndicator currentStep={1} totalSteps={5} completedSteps={[]} />)
    expect(screen.getByText('Início')).toBeDefined()
    expect(screen.getByText('GA4')).toBeDefined()
    expect(screen.getByText('Pixel')).toBeDefined()
    expect(screen.getByText('Ads')).toBeDefined()
    expect(screen.getByText('Revisão')).toBeDefined()
  })

  it('shows checkmark on completed steps', () => {
    render(<StepIndicator currentStep={3} totalSteps={5} completedSteps={[1, 2]} />)
    const circles = document.querySelectorAll('.rounded-full')
    expect(circles.length).toBe(5)
    expect(circles[0].textContent).toBe('✓')
    expect(circles[1].textContent).toBe('✓')
  })

  it('shows step number for incomplete steps', () => {
    render(<StepIndicator currentStep={1} totalSteps={3} completedSteps={[]} />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('highlights current step', () => {
    const { container } = render(<StepIndicator currentStep={3} totalSteps={5} completedSteps={[1, 2]} />)
    const circles = container.querySelectorAll('.rounded-full')
    expect(circles.length).toBe(5)
  })
})
