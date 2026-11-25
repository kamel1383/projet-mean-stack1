import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let token: string | null = null;
  try {
    token = localStorage.getItem('token');
  } catch {
    token = null;
  }

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Sur 401 (non autorisé / token expiré), nettoyage de la session et redirection vers /login
      if (error.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {}
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
