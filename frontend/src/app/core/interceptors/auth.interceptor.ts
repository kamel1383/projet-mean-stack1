import { HttpInterceptorFn } from '@angular/common/http';

// Ajoute le JWT à chaque requête. Adapter la clé si AuthService utilise un autre nom.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
