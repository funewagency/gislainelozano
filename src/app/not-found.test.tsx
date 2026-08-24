import { describe, it, expect, vi } from 'vitest';
import NotFound from './not-found';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('NotFound component', () => {
  it('redirects to the homepage /', () => {
    NotFound();
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
