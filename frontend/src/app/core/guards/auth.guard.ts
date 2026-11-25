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

  if (token && user && user.isActive) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
