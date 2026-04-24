import { describe, expect, it, vi } from 'vitest';
import { switchRole } from './actions';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Role Switch Action', () => {
  it('should set the session cookie and revalidate the home path', async () => {
    const cookieStore = await cookies();
    await switchRole('Admin');
    
    expect(cookieStore.set).toHaveBeenCalledWith(
      'contentops_session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, secure: true })
    );
    
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });
});
