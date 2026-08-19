import { describe, it, expect } from 'vitest';
import { unauthorized, notFound, badRequest, rateLimited, serverError } from './api-utils';

describe('unauthorized', () => {
  it('returns 401 with correct shape', async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Não autorizado');
    expect(body.code).toBe('UNAUTHORIZED');
  });
});

describe('notFound', () => {
  it('returns 404 with default message', async () => {
    const res = notFound();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Recurso não encontrado');
    expect(body.code).toBe('NOT_FOUND');
  });

  it('returns 404 with custom message', async () => {
    const res = notFound('Custom message');
    const body = await res.json();
    expect(body.error).toBe('Custom message');
  });
});

describe('badRequest', () => {
  it('returns 400 with message', async () => {
    const res = badRequest('Invalid input');
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid input');
    expect(body.code).toBe('BAD_REQUEST');
  });

  it('includes details when provided', async () => {
    const res = badRequest('Error', { field: 'name', reason: 'required' });
    const body = await res.json();
    expect(body.details).toEqual({ field: 'name', reason: 'required' });
  });
});

describe('rateLimited', () => {
  it('returns 429 with retry-after header', async () => {
    const res = rateLimited(30);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    const body = await res.json();
    expect(body.error).toBe('Muitas requisições. Aguarde um momento.');
    expect(body.code).toBe('RATE_LIMITED');
    expect(body.retryAfter).toBe(30);
  });
});

describe('serverError', () => {
  it('returns 500 with default message', async () => {
    const res = serverError(new Error('test error'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Erro interno do servidor');
    expect(body.code).toBe('SERVER_ERROR');
  });

  it('returns 500 with custom message', async () => {
    const res = serverError(new Error('test'), 'Custom error');
    const body = await res.json();
    expect(body.error).toBe('Custom error');
  });
});
