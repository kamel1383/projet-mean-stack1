/**
 * restaurateur-context.service.ts — Shared Restaurateur Workspace State
 *
 * Holds the list of restaurants owned by the logged-in restaurateur and the
 * currently selected `restaurantId` using Angular Signals, so switching restaurants
 * in the sidebar updates Dashboard, Manage Orders, Manage Dishes, and Manage Restaurant.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { Restaurant } from '../models/restaurant.model';
import { RestaurantService } from './restaurant.service';

/**
 * Service de contexte partagé pour l'espace restaurateur.
 * Permet de conserver la liste des restaurants appartenant au restaurateur connecté
 * et le restaurant actuellement sélectionné dans le sélecteur global.
 */
@Injectable({
  providedIn: 'root',
})
export class RestaurateurContextService {
  private restaurantService = inject(RestaurantService);

  private restaurantsSignal = signal<Restaurant[]>([]);
  private selectedRestaurantIdSignal = signal<string>('');
  private loadingSignal = signal<boolean>(false);

  readonly restaurants = this.restaurantsSignal.asReadonly();
  readonly selectedRestaurantId = this.selectedRestaurantIdSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly selectedRestaurant = computed<Restaurant | null>(() => {
    const id = this.selectedRestaurantIdSignal();
    return this.restaurantsSignal().find((r) => r._id === id) || null;
  });

  /**
   * Charge les restaurants du restaurateur connecté et sélectionne le premier par défaut.
   */
  loadMyRestaurants(force = false): void {
    if (!force && this.restaurantsSignal().length > 0) {
      return;
    }
    this.loadingSignal.set(true);
    this.restaurantService.getMyRestaurants().subscribe({
      next: ({ restaurants }) => {
        this.restaurantsSignal.set(restaurants);
        const currentId = this.selectedRestaurantIdSignal();
        const stillExists = restaurants.some((r) => r._id === currentId);
        if (!stillExists) {
          this.selectedRestaurantIdSignal.set(restaurants[0]?._id || '');
        }
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      },
    });
  }

  selectRestaurant(id: string): void {
    this.selectedRestaurantIdSignal.set(id);
  }

  /**
   * Met à jour un restaurant en mémoire après modification dans manage-restaurant.
   */
  updateLocalRestaurant(updated: Restaurant): void {
    this.restaurantsSignal.update((list) =>
      list.map((r) => (r._id === updated._id ? updated : r))
    );
  }

  clear(): void {
    this.restaurantsSignal.set([]);
    this.selectedRestaurantIdSignal.set('');
  }
}
