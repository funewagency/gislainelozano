import '@testing-library/jest-dom/vitest'

// Polyfill ResizeObserver (used by recharts, framer-motion)
if (typeof window !== 'undefined' && typeof ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any
}

// Polyfill matchMedia (used by responsive hooks)
if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// Polyfill IntersectionObserver (used by framer-motion useInView)
if (typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
    root = null
    rootMargin = ''
    thresholds = []
  } as any
}

// Polyfill scrollTo (some libraries use window.scrollTo)
if (typeof window !== 'undefined' && typeof window.scrollTo !== 'function') {
  window.scrollTo = () => {}
}

// Mock Next.js Image (avoids loading real images in tests)
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return { type: 'img', props: { src, alt, ...rest } } as any
  },
}))

// Mock Next.js Link (renders as regular <a> tag in tests)
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => ({
    type: 'a',
    props: { href, ...rest, children },
  }),
}))

// Suppress noisy console errors in tests
const originalError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('Not implemented:'))
  ) {
    return
  }
  originalError(...args)
}
