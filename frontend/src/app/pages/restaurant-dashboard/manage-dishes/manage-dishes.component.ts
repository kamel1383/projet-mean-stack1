import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../../../core/models/restaurant.model';
import { Dish, DishPayload, DishService } from '../../../core/services/dish.service';
import { RestaurateurContextService } from '../../../core/services/restaurateur-context.service';

@Component({
  selector: 'app-manage-dishes',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './manage-dishes.component.html',
  styleUrl: './manage-dishes.component.css',
})
export class ManageDishesComponent implements OnInit {
  private dishService = inject(DishService);
  private ctx = inject(RestaurateurContextService);

  restaurants = signal<Restaurant[]>([]);
  allDishes = signal<Dish[]>([]);
  // Filtre automatiquement les plats sur le restaurant actif sélectionné en haut de l'espace
  dishes = computed<Dish[]>(() => {
    const selectedId = this.ctx.selectedRestaurantId();
    const list = this.allDishes();
    if (!selectedId) return list;
    return list.filter((d) => {
      const rId = typeof d.restaurant === 'string' ? d.restaurant : d.restaurant?._id;
      return rId === selectedId;
    });
  });
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  editingId = signal<string | null>(null);

  form: DishPayload = {
    nom: '',
    description: '',
    prix: 0,
    image: '',
    categorie: '',
    disponible: true,
    restaurant: '',
  };

  constructor() {
    effect(() => {
      const selectedId = this.ctx.selectedRestaurantId();
      if (selectedId && !this.editingId()) {
        this.form.restaurant = selectedId;
      }
    });
  }

  ngOnInit(): void {
    this.loadDishes();
  }

  loadDishes(): void {
    this.loading.set(true);
    this.error.set('');
    this.dishService.getMyDishes().subscribe({
      next: ({ restaurants, dishes }) => {
        this.restaurants.set(restaurants);
        this.allDishes.set(dishes);
        const activeId = this.ctx.selectedRestaurantId();
        if (!this.form.restaurant && (activeId || restaurants.length > 0)) {
          this.form.restaurant = activeId || restaurants[0]._id;
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des plats.');
        this.loading.set(false);
      },
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form = {
      nom: '',
      description: '',
      prix: 0,
      image: '',
      categorie: '',
      disponible: true,
      restaurant: this.ctx.selectedRestaurantId() || this.restaurants()[0]?._id || '',
    };
  }

  editDish(dish: Dish): void {
    this.editingId.set(dish._id);
    this.error.set('');
    this.success.set('');
    const restaurantId =
      typeof dish.restaurant === 'string' ? dish.restaurant : dish.restaurant?._id ?? '';
    this.form = {
      nom: dish.nom,
      description: dish.description,
      prix: dish.prix,
      image: dish.image,
      categorie: dish.categorie,
      disponible: dish.disponible,
      restaurant: restaurantId,
    };
  }

  submitForm(): void {
    if (!this.form.nom.trim()) {
      this.error.set('Le nom du plat est obligatoire.');
      return;
    }
    if (this.form.prix < 0) {
      this.error.set('Le prix doit être positif.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const id = this.editingId();
    const request$ = id
      ? this.dishService.updateDish(id, this.form)
      : this.dishService.createDish(this.form);

    request$.subscribe({
      next: (saved) => {
        if (id) {
          this.dishes.update((list) => list.map((d) => (d._id === id ? saved : d)));
          this.success.set(`Plat "${saved.nom}" mis à jour.`);
        } else {
          this.dishes.update((list) => [saved, ...list]);
          this.success.set(`Plat "${saved.nom}" ajouté au menu.`);
        }
        this.saving.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de l’enregistrement.');
        this.saving.set(false);
      },
    });
  }

  toggleAvailability(dish: Dish): void {
    this.dishService.toggleAvailability(dish._id).subscribe({
      next: (updated) => {
        this.dishes.update((list) => list.map((d) => (d._id === updated._id ? updated : d)));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de modifier la disponibilité.');
      },
    });
  }

  deleteDish(dish: Dish): void {
    if (!confirm(`Supprimer le plat "${dish.nom}" ?`)) return;

    this.dishService.deleteDish(dish._id).subscribe({
      next: () => {
        this.dishes.update((list) => list.filter((d) => d._id !== dish._id));
        if (this.editingId() === dish._id) {
          this.resetForm();
        }
        this.success.set(`Plat "${dish.nom}" supprimé.`);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de supprimer ce plat.');
      },
    });
  }

  restaurantName(dish: Dish): string {
    return typeof dish.restaurant === 'string' ? '' : dish.restaurant?.nom ?? '';
  }
}
