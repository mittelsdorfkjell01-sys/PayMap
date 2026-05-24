import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

function sessionToken(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD is not set');
  return createHmac('sha256', pw).update('admin-session-v1').digest('hex');
}

export async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies();
    const value = store.get('admin_session')?.value;
    if (!value) return false;
    const expected = sessionToken();
    if (value.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function getSessionToken(): string {
  return sessionToken();
}
