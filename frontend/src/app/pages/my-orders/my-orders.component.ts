import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  orders: Order[] = [];
  loading = true;
  error = '';

  readonly statusLabels = STATUS_LABELS;
  readonly statusBadge = STATUS_BADGE;

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des commandes';
        this.loading = false;
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
