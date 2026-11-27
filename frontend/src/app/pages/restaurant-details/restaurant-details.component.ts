import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Dish, DishService } from '../../core/services/dish.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css',
})
export class RestaurantDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);
  private dishService = inject(DishService);
  private cartService = inject(CartService);

  restaurant = signal<Restaurant | null>(null);
  dishes = signal<Dish[]>([]);
  loading = signal(true);
  error = signal('');
  feedback = signal('');
  feedbackType = signal<'success' | 'warning'>('success');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Restaurant introuvable.');
      this.loading.set(false);
      return;
    }

    forkJoin({
      restaurant: this.restaurantService.getRestaurantById(id),
      dishes: this.dishService.getByRestaurant(id),
    }).subscribe({
      next: ({ restaurant, dishes }) => {
        this.restaurant.set(restaurant);
        this.dishes.set(dishes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Impossible de charger ce restaurant.');
        this.loading.set(false);
      },
    });
  }

  addToCart(dish: Dish): void {
    const resto = this.restaurant();
    if (!resto) return;

    if (!dish.disponible) {
      this.feedbackType.set('warning');
      this.feedback.set(`"${dish.nom}" est actuellement indisponible.`);
      return;
    }

    const sameRestaurant = this.cartService.addToCart(dish, {
      _id: resto._id,
      nom: resto.nom,
      fraisLivraison: resto.fraisLivraison,
    });

    if (sameRestaurant) {
      this.feedbackType.set('success');
      this.feedback.set(`"${dish.nom}" a été ajouté au panier.`);
    } else {
      this.feedbackType.set('warning');
      this.feedback.set(
        `Votre panier précédent a été réinitialisé pour commander chez ${resto.nom}. "${dish.nom}" a été ajouté.`,
      );
    }
  }
}
