/**
 * auth.service.ts — Authentication & Session State Service
 *
 * Manages user registration, login, logout, and reactive session state using Angular Signals.
 * Stores the JWT token and user object in `localStorage` so the user stays logged in
 * across page refreshes, and exposes read-only signals (`currentUser`, `isAuthenticated`,
 * `currentUserRole`) for components like NavbarComponent and guards.
 */
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

  // Safely read the JWT token from browser localStorage
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  // Safely parse the cached User JSON from localStorage
  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // Persist JWT + user to localStorage and update reactive Angular Signals
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

  // Remove session from localStorage and reset Signals to null
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

  // Registers a new client account and saves the returned JWT session
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

  // Authenticates with email/password and stores the returned JWT + user profile
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res && res.token && res.user) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  // Syncs updated profile data (e.g., new photo or name) into localStorage and Signal
  updateCurrentUser(user: User): void {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.error('Erreur mise à jour utilisateur localStorage :', e);
    }
    this.currentUserSignal.set(user);
  }

  // Clears the user session and navigates back to the login page
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
