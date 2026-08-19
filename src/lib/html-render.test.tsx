// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { RenderContent } from '@/lib/html-render'

describe('RenderContent', () => {
  describe('HTML content rendering', () => {
    it('renders HTML content with dangerouslySetInnerHTML', () => {
      const { container } = render(<RenderContent content="<p>Hello <strong>World</strong></p>" />)
      const inner = container.querySelector('span')
      expect(inner).toBeTruthy()
      expect(inner?.innerHTML).toBe('<p>Hello <strong>World</strong></p>')
    })

    it('renders HTML passed as children string', () => {
      const { container } = render(<RenderContent children="<div>Hello</div>" />)
      const inner = container.querySelector('span')
      expect(inner?.innerHTML).toBe('<div>Hello</div>')
    })

    it('gives precedence to content prop over children', () => {
      const { container } = render(<RenderContent content="<b>content</b>" children="<i>children</i>" />)
      const inner = container.querySelector('span')
      expect(inner?.innerHTML).toBe('<b>content</b>')
    })
  })

  describe('plain text with bold conversion', () => {
    it('renders plain text unchanged', () => {
      render(<RenderContent content="Hello World" />)
      expect(screen.getByText('Hello World')).toBeTruthy()
    })

    it('converts **text** to <strong> elements', () => {
      render(<RenderContent content="This is **bold** text" />)
      const strong = screen.getByText('bold')
      expect(strong).toBeTruthy()
      expect(strong.tagName).toBe('STRONG')
    })

    it('handles multiple bold sections', () => {
      render(<RenderContent content="**First** and **Second**" />)
      expect(screen.getByText('First').tagName).toBe('STRONG')
      expect(screen.getByText('Second').tagName).toBe('STRONG')
    })

    it('renders plain text between bold sections', () => {
      const { container } = render(<RenderContent content="**bold** not bold **also bold**" />)
      expect(container.textContent).toContain('not bold')
      expect(container.textContent).toContain('bold')
      expect(container.textContent).toContain('also bold')
    })
  })

  describe('sanitizeHtml', () => {
    it('strips <script> tags', () => {
      const { container } = render(
        <RenderContent content='<script>alert("xss")</script><p>safe</p>' />
      )
      expect(container.innerHTML).not.toContain('<script>')
      expect(container.innerHTML).not.toContain('alert')
      expect(container.innerHTML).toContain('<p>safe</p>')
    })

    it('strips <style> tags', () => {
      const { container } = render(
        <RenderContent content='<style>body { color: red; }</style><p>text</p>' />
      )
      expect(container.innerHTML).not.toContain('<style>')
      expect(container.innerHTML).not.toContain('color: red')
      expect(container.innerHTML).toContain('<p>text</p>')
    })

    it('strips event handlers (onclick with double quotes)', () => {
      const { container } = render(
        <RenderContent content='<button onclick="alert(1)">click</button>' />
      )
      expect(container.innerHTML).not.toContain('onclick')
    })

    it('strips event handlers (onerror with single quotes)', () => {
      const { container } = render(
        <RenderContent content="<img onerror='alert(1)' src='x' />" />
      )
      expect(container.innerHTML).not.toContain('onerror')
    })

    it('strips event handlers without quotes', () => {
      const { container } = render(
        <RenderContent content='<div onmouseover=alert(1)>hover</div>' />
      )
      expect(container.innerHTML).not.toContain('onmouseover')
    })

    it('preserves safe HTML attributes', () => {
      const { container } = render(
        <RenderContent content='<a href="https://example.com" class="link">click</a>' />
      )
      expect(container.innerHTML).toContain('href="https://example.com"')
      expect(container.innerHTML).toContain('class="link"')
    })
  })

  describe('null/undefined handling', () => {
    it('returns null when content is null', () => {
      const { container } = render(<RenderContent content={null as unknown as string} />)
      expect(container.innerHTML).toBe('')
    })

    it('returns null when content is undefined', () => {
      const { container } = render(<RenderContent />)
      expect(container.innerHTML).toBe('')
    })

    it('returns null when children is null', () => {
      const { container } = render(<RenderContent>{null}</RenderContent>)
      expect(container.innerHTML).toBe('')
    })

    it('returns null when content is empty string', () => {
      const { container } = render(<RenderContent content="" />)
      expect(container.innerHTML).toBe('')
    })
  })

  describe('as prop', () => {
    it('renders as span by default', () => {
      const { container } = render(<RenderContent content="hello" />)
      expect(container.querySelector('span')).toBeTruthy()
    })

    it('renders as div when as="div"', () => {
      const { container } = render(<RenderContent as="div" content="hello" />)
      expect(container.querySelector('div')).toBeTruthy()
      expect(container.querySelector('span')).toBeNull()
    })

    it('renders as p when as="p"', () => {
      const { container } = render(<RenderContent as="p" content="hello" />)
      expect(container.querySelector('p')).toBeTruthy()
    })

    it('uses the as tag for HTML content too', () => {
      const { container } = render(<RenderContent as="div" content="<b>html</b>" />)
      const el = container.querySelector('div')
      expect(el).toBeTruthy()
      expect(el?.innerHTML).toBe('<b>html</b>')
    })
  })

  describe('className and style props', () => {
    it('passes className through', () => {
      render(<RenderContent content="text" className="foo bar" />)
      const el = screen.getByText('text')
      expect(el.className).toBe('foo bar')
    })

    it('passes style through', () => {
      render(<RenderContent content="text" style={{ color: 'red', fontWeight: 'bold' }} />)
      const el = screen.getByText('text')
      expect(el.style.color).toBe('red')
      expect(el.style.fontWeight).toBe('bold')
    })

    it('passes className and style for HTML content', () => {
      const { container } = render(
        <RenderContent content="<p>html</p>" className="custom" style={{ margin: '10px' }} />
      )
      const el = container.querySelector('span')
      expect(el?.className).toBe('custom')
      expect(el?.style.margin).toBe('10px')
    })
  })

  describe('accentColor prop', () => {
    it('passes accentColor as a prop (renders without error)', () => {
      const { container } = render(<RenderContent content="hello" accentColor="#ff0000" />)
      expect(container.querySelector('span')).toBeTruthy()
    })
  })
})
