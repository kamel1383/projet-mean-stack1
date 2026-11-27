/**
 * restaurant.service.ts — Restaurant HTTP Service
 *
 * Wraps all `/api/restaurants*` endpoints:
 * - Public browsing & details (`getRestaurants`, `getRestaurantById`)
 * - Restaurateur actions (`getMyRestaurants`, `createRestaurant`, `updateRestaurant`)
 * - Admin moderation (`getAdminRestaurants`, `updateRestaurantStatus`,
 *   `createRestaurantForOwner`, `changeRestaurantOwner`).
 */
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

  // Public: fetches paginated validated restaurants with optional search, cuisine, and open filters
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
  // Admin: fetches all restaurants (pending, validated, suspended) with optional filters
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

  // Admin: approves ('valide') or suspends ('suspendu') a restaurant
  updateRestaurantStatus(
    id: string,
    statut: 'valide' | 'suspendu',
  ): Observable<Restaurant> {
    return this.http.put<Restaurant>(
      `${API_URL}/restaurants/${id}/status`,
      { statut },
    );
  }

  // Public: fetches a single validated restaurant by ID
  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${API_URL}/restaurants/${id}`);
  }

  // Restaurateur: creates a new restaurant (starts with status 'en_attente')
  createRestaurant(payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${API_URL}/restaurants`, payload);
  }

  // Updates an existing restaurant's details (name, hours, delivery fee, open toggle, etc.)
  updateRestaurant(id: string, payload: Partial<Restaurant>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${API_URL}/restaurants/${id}`, payload);
  }

  // Restaurateur: fetches only the restaurants owned by the logged-in user
  getMyRestaurants(): Observable<{ restaurants: Restaurant[] }> {
    return this.http.get<{ restaurants: Restaurant[] }>(`${API_URL}/restaurants/my`);
  }

  // Admin: creates a restaurant and assigns it directly to an existing restaurateur
  createRestaurantForOwner(payload: {
    ownerId: string;
    nom: string;
    description: string;
    adresse: string;
    typeCuisine: string;
    image?: string;
    horaires: string;
    fraisLivraison: number;
  }): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${API_URL}/restaurants/admin`, payload);
  }

  // Admin: transfers ownership of a restaurant to a different restaurateur
  changeRestaurantOwner(
    restaurantId: string,
    ownerId: string,
  ): Observable<{ message: string; restaurant: Restaurant }> {
    return this.http.patch<{ message: string; restaurant: Restaurant }>(
      `${API_URL}/restaurants/${restaurantId}/owner`,
      { ownerId },
    );
  }
}