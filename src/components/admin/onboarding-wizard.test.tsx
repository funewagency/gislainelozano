// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@/test/test-utils'
import { OnboardingWizard } from './onboarding-wizard'

const mockInitialConfig = {
  ga4Id: '',
  fbPixelId: '',
  gAdsId: '',
  gAdsLabel: '',
}

vi.mock('./step-indicator', () => ({
  StepIndicator: ({ currentStep, totalSteps, completedSteps }: any) => (
    <div data-testid="step-indicator" data-current={currentStep} data-total={totalSteps}>
      Step {currentStep}/{totalSteps}
    </div>
  ),
}))

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockReset()
  })

  it('renders step 1 welcome screen', () => {
    render(<OnboardingWizard initialConfig={mockInitialConfig} onComplete={() => {}} />)
    expect(screen.getByText('Bem-vindo')).toBeDefined()
    expect(screen.getByText('Começar')).toBeDefined()
  })

  it('shows step indicator on first step', () => {
    render(<OnboardingWizard initialConfig={mockInitialConfig} onComplete={() => {}} />)
    expect(screen.getByText('Step 1/5')).toBeDefined()
  })

  it('proceeds to step 2 on clicking Começar', () => {
    render(<OnboardingWizard initialConfig={mockInitialConfig} onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Começar'))
    expect(screen.getByText('Google Analytics')).toBeDefined()
    expect(screen.getByText('Step 2/5')).toBeDefined()
  })

  it('renders GA4 input on step 2', () => {
    render(<OnboardingWizard initialConfig={mockInitialConfig} onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Começar'))
    expect(screen.getByLabelText('Measurement ID')).toBeDefined()
  })

  it('goes back to step 1 from step 2', () => {
    render(<OnboardingWizard initialConfig={mockInitialConfig} onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Começar'))
    fireEvent.click(screen.getByText('Voltar'))
    expect(screen.getByText('Bem-vindo')).toBeDefined()
    expect(screen.getByText('Step 1/5')).toBeDefined()
  })

  it('navigates through all steps and completes', async () => {
    const onComplete = vi.fn()
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    )
    render(<OnboardingWizard initialConfig={mockInitialConfig} onComplete={onComplete} />)

    expect(screen.getByText('Bem-vindo')).toBeDefined()
    fireEvent.click(screen.getByText('Começar'))
    expect(screen.getByText('Google Analytics')).toBeDefined()

    fireEvent.click(screen.getByText('Avançar'))
    await waitFor(() => expect(screen.getByText('Facebook Pixel')).toBeDefined())

    fireEvent.click(screen.getByText('Avançar'))
    await waitFor(() => expect(screen.getByText('Google Ads')).toBeDefined())

    fireEvent.click(screen.getByText('Avançar'))
    await waitFor(() => expect(screen.getByText('Revisar')).toBeDefined())

    fireEvent.click(screen.getByText('Concluir'))
    await waitFor(() => expect(onComplete).toHaveBeenCalled())
  })

  it('shows error when save fails', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockRejectedValueOnce(new Error('Network error'))
    render(<OnboardingWizard initialConfig={mockInitialConfig} onComplete={() => {}} />)
    fireEvent.click(screen.getByText('Começar'))
    const ga4Input = screen.getByLabelText('Measurement ID')
    fireEvent.change(ga4Input, { target: { value: 'G-TEST123' } })
    fireEvent.click(screen.getByText('Avançar'))
    await waitFor(() => {
      expect(screen.getByText('Erro ao salvar progresso')).toBeDefined()
    })
  })
})
