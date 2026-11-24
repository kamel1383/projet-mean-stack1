import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Protège les pages côté Angular (le serveur revérifie quand même : règle 12)
export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!token || !user) return router.createUrlTree(['/login']);
  return roles.includes(user.role) ? true : router.createUrlTree(['/']);
};
