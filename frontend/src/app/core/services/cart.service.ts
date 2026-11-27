/**
 * cart.service.ts — Shopping Cart State Service
 *
 * Manages the customer's shopping cart in memory and persists it to `localStorage`
 * under `'foodexpress_cart'`. Uses an RxJS `BehaviorSubject` (`cart$`) so the Navbar
 * badge, Cart page, and Checkout page reactively update whenever items change.
 * Business rule: A cart can only contain dishes from ONE restaurant at a time.
 */
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
  // Reads saved cart state from localStorage on service initialization
  private loadCart(): CartState {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : { ...emptyCart };
    } catch {
      return { ...emptyCart };
    }
  }

  // Saves updated cart state to localStorage and notifies all subscribers via cart$
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

  // Increments the quantity of an existing dish in the cart by 1
  increaseQuantity(dishId: string): void {
    const state = { ...this.cartSubject.value, items: [...this.cartSubject.value.items] };
    const item = state.items.find((i) => i.dishId === dishId);
    if (item) {
      item.quantite += 1;
      this.persist(state);
    }
  }

  // Decrements quantity by 1, or removes the item (and resets cart if empty) when quantity reaches 0
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

  // Removes a specific dish from the cart and clears restaurant info if no items remain
  removeItem(dishId: string): void {
    const state = { ...this.cartSubject.value, items: [...this.cartSubject.value.items] };
    state.items = state.items.filter((i) => i.dishId !== dishId);
    if (state.items.length === 0) {
      this.persist({ ...emptyCart });
    } else {
      this.persist(state);
    }
  }

  // Resets the cart back to an empty state
  clearCart(): void {
    this.persist({ ...emptyCart });
  }

  /* ---------- getters ---------- */

  // Sum of (price * quantity) for all items in the cart
  getSubtotal(): number {
    return this.cartSubject.value.items.reduce((sum, i) => sum + i.prix * i.quantite, 0);
  }

  // Delivery fee of the currently selected restaurant
  getDeliveryFee(): number {
    return this.cartSubject.value.fraisLivraison;
  }

  // Grand total = subtotal + delivery fee
  getTotal(): number {
    return this.getSubtotal() + this.getDeliveryFee();
  }

  // Total number of dish units in the cart (used for the Navbar badge)
  getItemCount(): number {
    return this.cartSubject.value.items.reduce((sum, i) => sum + i.quantite, 0);
  }
}
