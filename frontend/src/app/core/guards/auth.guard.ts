/**
 * auth.guard.ts — Authentication Route Guard
 *
 * Prevents unauthenticated or deactivated users from accessing protected routes
 * (like `/profile`). Checks `localStorage` for a valid token and active user,
 * redirecting to `/login` if missing.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  let token: string | null = null;
  let user: any = null;

  try {
    token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    token = null;
    user = null;
  }

  // Allow navigation only if a token exists and the user account is active
  if (token && user && user.isActive) {
    return true;
  }

  // Redirect unauthenticated visitors to the login page
  return router.createUrlTree(['/login']);
};
