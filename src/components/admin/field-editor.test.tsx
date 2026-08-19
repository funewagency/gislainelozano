// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { createCommonEdgeCaseTests } from '@/test/field-test-harness'
import {
  TextField, ToggleField, SelectField, RangeField, ColorField,
  TextAreaField, ArrayField, ImageUploadField,
} from './field-editor'

// ── Edge case tests: every component must survive undefined/null props ──

createCommonEdgeCaseTests('TextField', TextField, { label: 'L', value: '', onChange: () => {} })
createCommonEdgeCaseTests('TextAreaField', TextAreaField, { label: 'L', value: '', onChange: () => {} })
createCommonEdgeCaseTests('ToggleField', ToggleField, { label: 'L', value: false, onChange: () => {} })
createCommonEdgeCaseTests('RangeField', RangeField, { label: 'L', value: 0, onChange: () => {} })
createCommonEdgeCaseTests('ColorField', ColorField, { label: 'L', value: '#000', onChange: () => {} })
createCommonEdgeCaseTests('ArrayField', ArrayField, { label: 'L', items: [], onChange: () => {} })
createCommonEdgeCaseTests('ImageUploadField', ImageUploadField, { label: 'L', value: '', onChange: () => {} })
createCommonEdgeCaseTests('SelectField', SelectField, {
  label: 'L', value: '', onChange: () => {}, options: [],
})

// ── SelectField: null/undefined options ──────────────────────────────────

describe('SelectField — options edge cases', () => {
  const base = { label: 'Escolha', value: '', onChange: () => {} } as const

  it('renders with null options', () => {
    expect(() => render(<SelectField {...base} options={null as unknown as []} />)).not.toThrow()
  })

  it('renders with undefined options', () => {
    expect(() => render(<SelectField {...base} options={undefined as unknown as []} />)).not.toThrow()
  })

  it('renders with empty options array', () => {
    expect(() => render(<SelectField {...base} options={[]} />)).not.toThrow()
  })

  it('renders with options containing null entries', () => {
    const opts = [null as unknown as { label: string; value: string }]
    expect(() => render(<SelectField {...base} options={opts} />)).not.toThrow()
  })
})

// ── ArrayField: null/undefined items ─────────────────────────────────────

describe('ArrayField — items edge cases', () => {
  const base = { label: 'Lista', items: [] as string[], onChange: () => {} } as const

  it('renders with null items', () => {
    expect(() => render(<ArrayField {...base} items={null as unknown as []} />)).not.toThrow()
  })

  it('renders with undefined items', () => {
    expect(() => render(<ArrayField {...base} items={undefined as unknown as []} />)).not.toThrow()
  })

  it('renders with items containing null/undefined values', () => {
    const items = ['a', null as unknown as string, undefined as unknown as string, 'b']
    expect(() => render(<ArrayField {...base} items={items} />)).not.toThrow()
    // All 4 items should render
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBe(4)
  })

  it('handles maxItems=0 (no add button)', () => {
    render(<ArrayField {...base} items={['a']} maxItems={0} />)
    expect(screen.queryByText(/Adicionar/)).toBeNull()
  })
})

// ── TextField ────────────────────────────────────────────────────────────

describe('TextField', () => {
  it('renders label', () => {
    render(<TextField label="Nome" value="" onChange={() => {}} />)
    expect(screen.getByText('Nome')).toBeDefined()
  })

  it('renders input with value', () => {
    render(<TextField label="Nome" value="João" onChange={() => {}} />)
    const input = screen.getByDisplayValue('João')
    expect(input).toBeDefined()
  })

  it('calls onChange when value changes', () => {
    const onChange = vi.fn()
    render(<TextField label="Nome" value="" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Maria' } })
    expect(onChange).toHaveBeenCalledWith('Maria')
  })

  it('renders with placeholder', () => {
    render(<TextField label="Nome" value="" onChange={() => {}} placeholder="Digite seu nome" />)
    expect(screen.getByPlaceholderText('Digite seu nome')).toBeDefined()
  })

  it('renders hint', () => {
    render(<TextField label="Nome" value="" onChange={() => {}} hint="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeDefined()
  })

  it('handles 50k character long value', () => {
    const long = 'x'.repeat(50000)
    render(<TextField label="Nome" value={long} onChange={() => {}} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value.length).toBe(50000)
  })

  it('handles special characters', () => {
    const special = '<script>alert("xss")</script> & "quotes" \'single\' 日本語 🔥'
    render(<TextField label="Nome" value={special} onChange={() => {}} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe(special)
  })

  it('handles empty value', () => {
    render(<TextField label="Nome" value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('')
  })
})

describe('ToggleField', () => {
  it('renders label', () => {
    render(<ToggleField label="Ativo" value={false} onChange={() => {}} />)
    expect(screen.getByText('Ativo')).toBeDefined()
  })

  it('shows checked state', () => {
    render(<ToggleField label="Ativo" value={true} onChange={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeDefined()
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })

  it('shows unchecked state', () => {
    render(<ToggleField label="Ativo" value={false} onChange={() => {}} />)
    const toggle = screen.getByRole('switch')
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('calls onChange when toggled', () => {
    const onChange = vi.fn()
    render(<ToggleField label="Ativo" value={false} onChange={onChange} />)
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('SelectField', () => {
  const options = [
    { value: 'op1', label: 'Opção 1' },
    { value: 'op2', label: 'Opção 2' },
  ]

  it('renders label', () => {
    render(<SelectField label="Escolha" value="" onChange={() => {}} options={options} />)
    expect(screen.getByText('Escolha')).toBeDefined()
  })

  it('renders all options', () => {
    render(<SelectField label="Escolha" value="" onChange={() => {}} options={options} />)
    expect(screen.getByText('Opção 1')).toBeDefined()
    expect(screen.getByText('Opção 2')).toBeDefined()
  })

  it('shows selected value', () => {
    render(<SelectField label="Escolha" value="op2" onChange={() => {}} options={options} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('op2')
  })

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn()
    render(<SelectField label="Escolha" value="op1" onChange={onChange} options={options} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'op2' } })
    expect(onChange).toHaveBeenCalledWith('op2')
  })
})

describe('RangeField', () => {
  it('renders label', () => {
    render(<RangeField label="Tamanho" value={50} onChange={() => {}} min={0} max={100} />)
    expect(screen.getByText('Tamanho')).toBeDefined()
  })

  it('shows current value with suffix', () => {
    render(<RangeField label="Tamanho" value={50} onChange={() => {}} min={0} max={100} suffix="px" />)
    expect(screen.getByText('50px')).toBeDefined()
  })

  it('shows value without suffix', () => {
    render(<RangeField label="Tamanho" value={75} onChange={() => {}} min={0} max={100} />)
    expect(screen.getByText('75')).toBeDefined()
  })

  it('calls onChange when slider changes', () => {
    const onChange = vi.fn()
    render(<RangeField label="Tamanho" value={50} onChange={onChange} min={0} max={100} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '75' } })
    expect(onChange).toHaveBeenCalledWith(75)
  })
})

describe('ColorField', () => {
  it('renders label', () => {
    render(<ColorField label="Cor primária" value="#000000" onChange={() => {}} />)
    expect(screen.getByText('Cor primária')).toBeDefined()
  })

  it('renders label', () => {
    render(<ColorField label="Cor" value="#000000" onChange={() => {}} />)
    expect(screen.getByText('Cor')).toBeDefined()
  })

  it('renders color picker and text input', () => {
    render(<ColorField label="Cor" value="#FF0000" onChange={() => {}} />)
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeDefined()
    const colorPicker = document.querySelector('input[type="color"]')
    expect(colorPicker).toBeDefined()
  })

  it('calls onChange when text changes', () => {
    const onChange = vi.fn()
    render(<ColorField label="Cor" value="#000000" onChange={onChange} />)
    const textInput = screen.getByRole('textbox')
    fireEvent.change(textInput, { target: { value: '#FFFFFF' } })
    expect(onChange).toHaveBeenCalledWith('#FFFFFF')
  })
})

describe('TextAreaField', () => {
  it('renders label', () => {
    render(<TextAreaField label="Descrição" value="" onChange={() => {}} />)
    expect(screen.getByText('Descrição')).toBeDefined()
  })

  it('renders textarea with value', () => {
    render(<TextAreaField label="Descrição" value="Texto longo" onChange={() => {}} />)
    expect(screen.getByDisplayValue('Texto longo')).toBeDefined()
  })

  it('calls onChange when text changes', () => {
    const onChange = vi.fn()
    render(<TextAreaField label="Descrição" value="" onChange={onChange} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Novo texto' } })
    expect(onChange).toHaveBeenCalledWith('Novo texto')
  })

  it('renders hint', () => {
    render(<TextAreaField label="Descrição" value="" onChange={() => {}} hint="Max 500 chars" />)
    expect(screen.getByText('Max 500 chars')).toBeDefined()
  })

  it('handles very long text', () => {
    const long = 'x'.repeat(5000)
    render(<TextAreaField label="Descrição" value={long} onChange={() => {}} />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value.length).toBe(5000)
  })
})

describe('ArrayField', () => {
  it('renders label', () => {
    render(<ArrayField label="Lista" items={['a', 'b']} onChange={() => {}} />)
    expect(screen.getByText('Lista')).toBeDefined()
  })

  it('renders items', () => {
    render(<ArrayField label="Lista" items={['a', 'b']} onChange={() => {}} />)
    expect(screen.getByDisplayValue('a')).toBeDefined()
    expect(screen.getByDisplayValue('b')).toBeDefined()
  })

  it('calls onChange when item is removed', () => {
    const onChange = vi.fn()
    render(<ArrayField label="Lista" items={['a', 'b']} onChange={onChange} />)
    const removeButtons = screen.getAllByRole('button')
    fireEvent.click(removeButtons[0])
    expect(onChange).toHaveBeenCalledWith(['b'])
  })

  it('adds new empty item', () => {
    const onChange = vi.fn()
    render(<ArrayField label="Lista" items={['a']} onChange={onChange} maxItems={5} />)
    const addButton = screen.getByText(/Adicionar/)
    fireEvent.click(addButton)
    expect(onChange).toHaveBeenCalledWith(['a', ''])
  })

  it('does not add item when maxItems reached', () => {
    const onChange = vi.fn()
    render(<ArrayField label="Lista" items={['a', 'b']} onChange={onChange} maxItems={2} />)
    expect(screen.queryByText(/Adicionar/)).toBeNull()
  })
})
