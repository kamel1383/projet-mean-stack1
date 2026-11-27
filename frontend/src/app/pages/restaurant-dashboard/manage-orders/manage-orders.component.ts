import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantOrderService } from '../../../core/services/restaurant-order.service';
import {
  NEXT_STATUS, Order, OrderStatus, STATUS_BADGE, STATUS_LABELS,
} from '../../../core/models/order.model';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './manage-orders.component.html',
  styleUrl: './manage-orders.component.css',
})
export class ManageOrdersComponent implements OnInit {
  private service = inject(RestaurantOrderService);
  private cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  selected?: Order;
  filter = '';
  page = 1;
  pages = 1;
  loading = true;
  error = '';

  labels = STATUS_LABELS;
  badges = STATUS_BADGE;
  statusList = Object.keys(STATUS_LABELS) as OrderStatus[];

  ngOnInit() { this.load(); }

  load(): void {
  this.loading = true;
  this.error = '';

  this.service.getOrders({
    statut: this.filter || undefined,
    page: this.page,
    limit: 10,
  }).subscribe({
    next: (result) => {
      this.orders = result.orders;
      this.pages = result.pages;
      this.loading = false;
      this.cdr.markForCheck();
    },
    error: (err) => {
      this.error = err.error?.message || 'Erreur de chargement';
      this.loading = false;
      this.cdr.markForCheck();
    },
  });
}

  onFilterChange() { this.page = 1; this.load(); }

  goTo(p: number) { if (p >= 1 && p <= this.pages) { this.page = p; this.load(); } }

  next(o: Order): OrderStatus[] { return NEXT_STATUS[o.statut]; }

  change(o: Order, statut: OrderStatus) {
    if (statut === 'annulee' && !confirm('Refuser / annuler cette commande ?')) return;
    this.service.updateStatus(o._id, statut).subscribe({
      next: (updated) => {
        o.statut = updated.statut;
        this.error = '';
      },
      error: (e) => { this.error = e.error?.message || 'Changement de statut impossible'; },
    });
  }

  toggleDetails(o: Order) { this.selected = this.selected?._id === o._id ? undefined : o; }
}
