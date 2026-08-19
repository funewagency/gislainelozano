import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRateLimiter, shouldRateLimit } from './rate-limit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within the limit', () => {
    const limiter = createRateLimiter('test', { window: 60_000, max: 3 });
    expect(limiter.check('ip:1')).toEqual({ allowed: true, remaining: 2 });
    expect(limiter.check('ip:1')).toEqual({ allowed: true, remaining: 1 });
    expect(limiter.check('ip:1')).toEqual({ allowed: true, remaining: 0 });
  });

  it('blocks when limit is exceeded', () => {
    const limiter = createRateLimiter('test2', { window: 60_000, max: 2 });
    limiter.check('ip:1');
    limiter.check('ip:1');
    const result = limiter.check('ip:1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after the window expires', () => {
    const limiter = createRateLimiter('test3', { window: 10_000, max: 1 });
    expect(limiter.check('ip:1').allowed).toBe(true);
    expect(limiter.check('ip:1').allowed).toBe(false);

    vi.advanceTimersByTime(10_001);
    expect(limiter.check('ip:1').allowed).toBe(true);
  });

  it('tracks different keys independently', () => {
    const limiter = createRateLimiter('test4', { window: 60_000, max: 2 });
    expect(limiter.check('ip:a').allowed).toBe(true);
    expect(limiter.check('ip:a').allowed).toBe(true);
    expect(limiter.check('ip:a').allowed).toBe(false);

    const result = limiter.check('ip:b');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('supports reset', () => {
    const limiter = createRateLimiter('test5', { window: 60_000, max: 1 });
    limiter.check('ip:1');
    limiter.reset('ip:1');
    expect(limiter.check('ip:1').allowed).toBe(true);
  });

  it('creates isolated named limiters', () => {
    const a = createRateLimiter('iso-a', { window: 60_000, max: 1 });
    const b = createRateLimiter('iso-b', { window: 60_000, max: 1 });
    a.check('key');
    expect(a.check('key').allowed).toBe(false);
    expect(b.check('key').allowed).toBe(true);
  });
});

describe('shouldRateLimit', () => {
  const original = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = original;
  });

  it('returns true in production', () => {
    process.env.NODE_ENV = 'production';
    expect(shouldRateLimit()).toBe(true);
  });

  it('returns false in development', () => {
    process.env.NODE_ENV = 'development';
    expect(shouldRateLimit()).toBe(false);
  });

  it('returns false in test', () => {
    process.env.NODE_ENV = 'test';
    expect(shouldRateLimit()).toBe(false);
  });

  it('returns false when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    expect(shouldRateLimit()).toBe(false);
  });
});
