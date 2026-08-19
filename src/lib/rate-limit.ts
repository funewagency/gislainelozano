export interface RateLimitConfig {
  window: number;
  max: number;
}

interface Entry {
  count: number;
  windowStart: number;
}

const stores = new Map<string, Map<string, Entry>>();

export function createRateLimiter(name: string, config: RateLimitConfig) {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store!) {
      if (now - entry.windowStart > config.window * 2) {
        store!.delete(key);
      }
    }
  }, config.window);

  if (cleanup && typeof cleanup === 'object' && 'unref' in cleanup) {
    cleanup.unref();
  }

  return {
    check(key: string): { allowed: boolean; remaining: number } {
      const now = Date.now();
      const entry = store!.get(key);

      if (!entry || now - entry.windowStart > config.window) {
        store!.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: config.max - 1 };
      }

      if (entry.count >= config.max) {
        const retryAfter = Math.ceil((entry.windowStart + config.window - now) / 1000);
        return { allowed: false, remaining: 0 };
      }

      entry.count++;
      return { allowed: true, remaining: config.max - entry.count };
    },

    reset(key: string) {
      store!.delete(key);
    },
  };
}

export function shouldRateLimit(): boolean {
  return process.env.NODE_ENV === 'production';
}

export const authLimiter = createRateLimiter('auth', {
  window: 60_000,
  max: 5,
});

export const mutationLimiter = createRateLimiter('mutation', {
  window: 30_000,
  max: 20,
});

export const readLimiter = createRateLimiter('read', {
  window: 60_000,
  max: 60,
});

export const contactLimiter = createRateLimiter('contact', {
  window: 60_000,
  max: parseInt(process.env.RATE_LIMIT_CONTACT_MAX || '5', 10),
});

export const generateLimiter = createRateLimiter('generate', {
  window: 60_000,
  max: 2,
});
