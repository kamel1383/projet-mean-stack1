import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../api.config';
import { AuthResponse, User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // État réactif basé sur les Signals Angular
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(this.getStoredToken());

  // Expositions en lecture seule
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal() && !!this.tokenSignal());
  readonly currentUserRole = computed<UserRole | null>(() => this.currentUserSignal()?.role || null);

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: User): void {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.error('Erreur écriture localStorage :', e);
    }
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
  }

  private clearSession(): void {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.error('Erreur vidage localStorage :', e);
    }
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  register(data: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
    confirmation: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, data).pipe(
      tap((res) => {
        if (res && res.token && res.user) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res && res.token && res.user) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  updateCurrentUser(user: User): void {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.error('Erreur mise à jour utilisateur localStorage :', e);
    }
    this.currentUserSignal.set(user);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
