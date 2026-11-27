import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartState } from '../../core/services/cart.service';
import { OrderService, CreateOrderPayload } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cartService = inject(CartService);
  private orderService = inject(OrderService);

  cart: CartState = { restaurantId: '', restaurantNom: '', fraisLivraison: 0, items: [] };
  form!: FormGroup;
  loading = false;
  error = '';
  success = false;

  ngOnInit(): void {
    this.cartService.cart$.subscribe((c) => (this.cart = c));

    // Si le panier est vide, rediriger vers /cart
    if (this.cart.items.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.form = this.fb.group({
      adresseLivraison: ['', [Validators.required, Validators.minLength(5)]],
      remarque: [''],
      modePaiement: ['livraison'],
    });
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

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = '';

    const payload: CreateOrderPayload = {
      restaurant: this.cart.restaurantId,
      articles: this.cart.items.map((i) => ({ plat: i.dishId, quantite: i.quantite })),
      adresseLivraison: this.form.value.adresseLivraison,
      modePaiement: this.form.value.modePaiement,
      remarque: this.form.value.remarque || '',
    };

    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.success = true;
        this.cartService.clearCart();
        setTimeout(() => this.router.navigate(['/my-orders']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de la création de la commande';
      },
    });
  }
}
