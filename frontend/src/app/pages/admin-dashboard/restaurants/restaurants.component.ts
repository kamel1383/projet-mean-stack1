/**
 * restaurants.component.ts — Admin Restaurant Moderation Page (`/admin-dashboard/restaurants`)
 *
 * Lists all restaurants across the platform (pending, validated, suspended),
 * with search, status filtering, pagination, and one-click Validate / Suspend buttons.
 */
import { Component, OnInit, inject, signal } from '@angular/core';

import {
  Restaurant,
  RestaurantStatut,
} from '../../../core/models/restaurant.model';
import { RestaurantService } from '../../../core/services/restaurant.service';

type AdminStatusFilter = 'all' | RestaurantStatut;

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  templateUrl: './restaurants.component.html',
  styleUrl: './restaurants.component.css',
})
export class RestaurantsComponent implements OnInit {
  private restaurantService = inject(RestaurantService);

  restaurants = signal<Restaurant[]>([]);
  searchText = signal('');
  statusFilter = signal<AdminStatusFilter>('all');

  page = signal(1);
  pages = signal(1);
  total = signal(0);
  loading = signal(false);
  busyId = signal<string | null>(null);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadRestaurants();
  }

  // Fetches paginated restaurants for admin moderation (all statuses)
  loadRestaurants(page = 1): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filters: {
      search?: string;
      statut?: RestaurantStatut;
      page: number;
      limit: number;
    } = {
      search: this.searchText(),
      page,
      limit: 10,
    };

    if (this.statusFilter() !== 'all') {
const selectedStatus = this.statusFilter();

if (selectedStatus !== 'all') {
  filters.statut = selectedStatus;
}    }

    this.restaurantService.getAdminRestaurants(filters).subscribe({
      next: (result) => {
        this.restaurants.set(result.restaurants);
        this.total.set(result.total);
        this.page.set(result.page);
        this.pages.set(result.pages);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Impossible de charger les restaurants. Vérifie que tu es connecté comme administrateur.',
        );
        this.loading.set(false);
      },
    });
  }

  updateSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  updateStatusFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (
      value === 'all' ||
      value === 'en_attente' ||
      value === 'valide' ||
      value === 'suspendu'
    ) {
      this.statusFilter.set(value);
    }
  }

  applyFilters(): void {
    this.loadRestaurants(1);
  }

  // Approves ('valide') or suspends ('suspendu') a restaurant and reloads the current page
  changeStatus(restaurant: Restaurant, statut: 'valide' | 'suspendu'): void {
    this.busyId.set(restaurant._id);
    this.errorMessage.set('');

    this.restaurantService
      .updateRestaurantStatus(restaurant._id, statut)
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.loadRestaurants(this.page());
        },
        error: () => {
          this.busyId.set(null);
          this.errorMessage.set('La mise à jour du statut a échoué.');
        },
      });
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.loadRestaurants(this.page() - 1);
    }
  }

  nextPage(): void {
    if (this.page() < this.pages()) {
      this.loadRestaurants(this.page() + 1);
    }
  }

  statusLabel(statut: RestaurantStatut): string {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'valide':
        return 'Validé';
      case 'suspendu':
        return 'Suspendu';
    }
  }
}