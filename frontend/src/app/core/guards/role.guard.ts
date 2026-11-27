/**
 * role.guard.ts — Role-Based Route Guard
 *
 * Restricts routes to specific user roles (`'client'`, `'restaurateur'`, `'admin'`).
 * - If not logged in -> redirects to `/login` with `returnUrl` query param.
 * - If account is inactive -> clears session and redirects to `/login`.
 * - If role doesn't match -> redirects to `/` (home page).
 */
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

/**
 * Garde d'autorisation par rôle :
 * - Fonctionne soit par appel de fonction : canActivate: [roleGuard(['admin'])]
 * - Soit par déclaration directe avec données : canActivate: [roleGuard], data: { roles: ['admin'] }
 */
export const roleGuard = (expectedRoles?: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
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

    if (!token || !user) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    if (!user.isActive) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
      return router.createUrlTree(['/login']);
    }

    const roles = expectedRoles || route.data?.['roles'] || [];

    if (roles.length === 0 || roles.includes(user.role)) {
      return true;
    }

    // Mauvais rôle : redirection vers la page d'accueil
    return router.createUrlTree(['/']);
  };
};
