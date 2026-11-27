/**
 * my-orders.component.ts — Client Order History Page (`/my-orders`)
 *
 * Protected by `roleGuard(['client'])`. Fetches the logged-in customer's past and
 * active orders from `OrderService.getMyOrders()` and maps status codes to French
 * labels (`STATUS_LABELS`) and Bootstrap badge classes (`STATUS_BADGE`).
 */
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus, STATUS_LABELS, STATUS_BADGE } from '../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css',
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
private cdr = inject(ChangeDetectorRef);
  orders: Order[] = [];
  loading = true;
  error = '';

  readonly statusLabels = STATUS_LABELS;
  readonly statusBadge = STATUS_BADGE;

  // Fetches the logged-in customer's order history on component initialization
  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des commandes';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  getBadgeClass(statut: OrderStatus): string {
    return this.statusBadge[statut] || 'bg-secondary';
  }

  getLabel(statut: OrderStatus): string {
    return this.statusLabels[statut] || statut;
  }
}
