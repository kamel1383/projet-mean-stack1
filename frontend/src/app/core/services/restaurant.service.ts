import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../api.config';
import { Restaurant, RestaurantStatut } from '../models/restaurant.model';

export interface RestaurantPage {
  restaurants: Restaurant[];
  total: number;
  page: number;
  pages: number;
}

export interface RestaurantFilters {
  search?: string;
  typeCuisine?: string;
  isOpen?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private http = inject(HttpClient);

  getRestaurants(
    filters: RestaurantFilters = {},
  ): Observable<RestaurantPage> {
    let params = new HttpParams();

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.typeCuisine?.trim()) {
      params = params.set('typeCuisine', filters.typeCuisine.trim());
    }

    if (filters.isOpen !== undefined) {
      params = params.set('isOpen', String(filters.isOpen));
    }

    if (filters.page !== undefined) {
      params = params.set('page', String(filters.page));
    }

    if (filters.limit !== undefined) {
      params = params.set('limit', String(filters.limit));
    }

    return this.http.get<RestaurantPage>(
      `${API_URL}/restaurants`,
      { params },
    );
  }
    getAdminRestaurants(filters: {
    search?: string;
    statut?: RestaurantStatut;
    page?: number;
    limit?: number;
  } = {}): Observable<RestaurantPage> {
    let params = new HttpParams();

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.statut) {
      params = params.set('statut', filters.statut);
    }

    if (filters.page !== undefined) {
      params = params.set('page', String(filters.page));
    }

    if (filters.limit !== undefined) {
      params = params.set('limit', String(filters.limit));
    }

    return this.http.get<RestaurantPage>(
      `${API_URL}/restaurants/admin`,
      { params },
    );
  }

  updateRestaurantStatus(
    id: string,
    statut: 'valide' | 'suspendu',
  ): Observable<Restaurant> {
    return this.http.put<Restaurant>(
      `${API_URL}/restaurants/${id}/status`,
      { statut },
    );
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${API_URL}/restaurants/${id}`);
  }

  createRestaurant(payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${API_URL}/restaurants`, payload);
  }

  updateRestaurant(id: string, payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${API_URL}/restaurants/${id}`, payload);
  }
}