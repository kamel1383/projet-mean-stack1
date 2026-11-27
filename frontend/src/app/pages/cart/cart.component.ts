import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartState } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cartService = inject(CartService);
  cart: CartState = { restaurantId: '', restaurantNom: '', fraisLivraison: 0, items: [] };

  constructor() {
    this.cartService.cart$.subscribe((c) => (this.cart = c));
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }
  get deliveryFee(): number {
    return this.cartService.getDeliveryFee();
  }
  get total(): number {
    return this.cartService.getTotal();
  }
  get isEmpty(): boolean {
    return this.cart.items.length === 0;
  }

  increase(dishId: string): void {
    this.cartService.increaseQuantity(dishId);
  }
  decrease(dishId: string): void {
    this.cartService.decreaseQuantity(dishId);
  }
  remove(dishId: string): void {
    this.cartService.removeItem(dishId);
  }
  clear(): void {
    this.cartService.clearCart();
  }
}
