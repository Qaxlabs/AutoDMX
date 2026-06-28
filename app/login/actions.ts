'use server';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function sha256(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex');
}

export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;

  if (!dashboardPassword) {
    console.error('[Login Error] DASHBOARD_PASSWORD is not set in environment variables.');
    return redirect(`/login?error=${encodeURIComponent('Server configuration error: DASHBOARD_PASSWORD is not set')}`);
  }

  if (password !== dashboardPassword) {
    return redirect(`/login?error=${encodeURIComponent('Incorrect password')}`);
  }

  // Generate session cookie
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const expiresAt = Date.now() + maxAge * 1000;
  const payload = String(expiresAt);
  const signature = sha256(`${payload}:${dashboardPassword}`);
  const cookieValue = `${payload}.${signature}`;

  cookies().set('autodmx_session', cookieValue, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  });

  redirect('/dashboard');
}

export async function logout() {
  cookies().set('autodmx_session', '', {
    path: '/',
    maxAge: 0,
  });
  redirect('/login');
}
