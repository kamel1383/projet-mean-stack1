import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  dishId: string;
  nom: string;
  prix: number;
  quantite: number;
  image: string;
  disponible: boolean;
}

export interface CartState {
  restaurantId: string;
  restaurantNom: string;
  fraisLivraison: number;
  items: CartItem[];
}

const CART_KEY = 'foodexpress_cart';

const emptyCart: CartState = {
  restaurantId: '',
  restaurantNom: '',
  fraisLivraison: 0,
  items: [],
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<CartState>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  /* ---------- persistence ---------- */
  private loadCart(): CartState {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : { ...emptyCart };
    } catch {
      return { ...emptyCart };
    }
  }

  private persist(state: CartState): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state));
    } catch {}
    this.cartSubject.next(state);
  }

  /* ---------- actions ---------- */

  /**
   * Ajoute un plat au panier.
   * Si le panier contient déjà des plats d'un autre restaurant,
   * on réinitialise le panier et on prévient l'utilisateur (retourne false).
   */
  addToCart(
    dish: { _id: string; nom: string; prix: number; image?: string; disponible?: boolean },
    restaurant: { _id: string; nom: string; fraisLivraison: number }
  ): boolean {
    if (dish.disponible === false) {
      return false; // plat indisponible
    }

    let state = { ...this.cartSubject.value, items: [...this.cartSubject.value.items] };
    let cartReset = false;

    // Cohérence restaurant
    if (state.restaurantId && state.restaurantId !== restaurant._id) {
      state = { ...emptyCart, items: [] };
      cartReset = true;
    }

    state.restaurantId = restaurant._id;
    state.restaurantNom = restaurant.nom;
    state.fraisLivraison = restaurant.fraisLivraison;

    const existing = state.items.find((i) => i.dishId === dish._id);
    if (existing) {
      existing.quantite += 1;
    } else {
      state.items.push({
        dishId: dish._id,
        nom: dish.nom,
        prix: dish.prix,
        quantite: 1,
        image: dish.image || '',
        disponible: dish.disponible ?? true,
      });
    }

    this.persist(state);
    return !cartReset; // false = panier réinitialisé (alerte côté composant)
  }

  increaseQuantity(dishId: string): void {
    const state = { ...this.cartSubject.value, items: [...this.cartSubject.value.items] };
    const item = state.items.find((i) => i.dishId === dishId);
    if (item) {
      item.quantite += 1;
      this.persist(state);
    }
  }

  decreaseQuantity(dishId: string): void {
    const state = { ...this.cartSubject.value, items: [...this.cartSubject.value.items] };
    const idx = state.items.findIndex((i) => i.dishId === dishId);
    if (idx === -1) return;

    if (state.items[idx].quantite > 1) {
      state.items[idx] = { ...state.items[idx], quantite: state.items[idx].quantite - 1 };
    } else {
      state.items.splice(idx, 1);
    }
    if (state.items.length === 0) {
      this.persist({ ...emptyCart });
    } else {
      this.persist(state);
    }
  }

  removeItem(dishId: string): void {
    const state = { ...this.cartSubject.value, items: [...this.cartSubject.value.items] };
    state.items = state.items.filter((i) => i.dishId !== dishId);
    if (state.items.length === 0) {
      this.persist({ ...emptyCart });
    } else {
      this.persist(state);
    }
  }

  clearCart(): void {
    this.persist({ ...emptyCart });
  }

  /* ---------- getters ---------- */

  getSubtotal(): number {
    return this.cartSubject.value.items.reduce((sum, i) => sum + i.prix * i.quantite, 0);
  }

  getDeliveryFee(): number {
    return this.cartSubject.value.fraisLivraison;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getDeliveryFee();
  }

  getItemCount(): number {
    return this.cartSubject.value.items.reduce((sum, i) => sum + i.quantite, 0);
  }
}
