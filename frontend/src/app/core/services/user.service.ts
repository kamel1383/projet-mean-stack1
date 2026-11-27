/**
 * user.service.ts — User Profile & Admin User/Restaurateur HTTP Service
 *
 * Wraps `/api/users*` endpoints for:
 * - Logged-in user profile (`getProfile`, `updateProfile`, `changePassword`)
 * - Admin user management (`getUsers`, `updateUserStatus`)
 * - Admin restaurateur management (`getRestaurateurs`, `createRestaurateurWithRestaurant`,
 *   `updateRestaurateur`, `resetRestaurateurPassword`).
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { User, UserListResponse } from '../models/user.model';
import { Restaurant } from '../models/restaurant.model';

export interface RestaurateurWithRestaurants extends User {
  restaurants: Restaurant[];
}

export interface RestaurateurListResponse {
  restaurateurs: RestaurateurWithRestaurants[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface CreateRestaurateurPayload {
  user: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
  };
  restaurant: {
    nom: string;
    description: string;
    adresse: string;
    typeCuisine: string;
    image?: string;
    horaires: string;
    fraisLivraison: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  // Profil connecté
  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${API_URL}/users/me`);
  }

  updateProfile(data: {
    nom?: string;
    prenom?: string;
    telephone?: string;
    photoProfil?: string;
  }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${API_URL}/users/me`, data);
  }

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmation: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_URL}/users/me/password`, data);
  }

  // Espace Admin
  getUsers(params?: {
    search?: string;
    page?: number;
    limit?: number;
    role?: string;
  }): Observable<UserListResponse> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.role) httpParams = httpParams.set('role', params.role);

    return this.http.get<UserListResponse>(`${API_URL}/users`, { params: httpParams });
  }

  // Admin: activates or deactivates a user account
  updateUserStatus(userId: string, isActive: boolean): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(`${API_URL}/users/${userId}/status`, {
      isActive,
    });
  }

  // --- Gestion des restaurateurs par l'admin ---
  getRestaurateurs(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<RestaurateurListResponse> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<RestaurateurListResponse>(`${API_URL}/users/restaurateurs`, {
      params: httpParams,
    });
  }

  // Admin: creates a restaurateur account and their first restaurant in one request
  createRestaurateurWithRestaurant(payload: CreateRestaurateurPayload): Observable<{
    message: string;
    user: User;
    restaurant: Restaurant;
    credentials: { email: string; password: string };
  }> {
    return this.http.post<{
      message: string;
      user: User;
      restaurant: Restaurant;
      credentials: { email: string; password: string };
    }>(`${API_URL}/users/restaurateurs`, payload);
  }

  // Admin: updates a restaurateur's personal details (name, email, phone)
  updateRestaurateur(
    id: string,
    data: { nom?: string; prenom?: string; email?: string; telephone?: string }
  ): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(
      `${API_URL}/users/restaurateurs/${id}`,
      data
    );
  }

  // Admin: resets a restaurateur's password and returns the new credentials
  resetRestaurateurPassword(
    id: string,
    password: string
  ): Observable<{ message: string; credentials: { email: string; password: string } }> {
    return this.http.patch<{
      message: string;
      credentials: { email: string; password: string };
    }>(`${API_URL}/users/restaurateurs/${id}/password`, { password });
  }
}
