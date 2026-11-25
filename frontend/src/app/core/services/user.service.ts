import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { User, UserListResponse } from '../models/user.model';

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

  updateUserStatus(userId: string, isActive: boolean): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(`${API_URL}/users/${userId}/status`, {
      isActive,
    });
  }
}
