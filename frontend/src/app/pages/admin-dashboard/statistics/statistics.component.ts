/**
 * statistics.component.ts — Admin Platform Statistics Page (`/admin-dashboard/statistics`)
 *
 * Fetches platform-wide KPIs (total clients, restaurants, orders, global revenue, and
 * order breakdown by status) from `StatsService.getAdminStats()`.
 */
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatsService } from '../../../core/services/stats.service';
import { AdminStats } from '../../../core/models/stats.model';
import { STATUS_LABELS, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit {
  private statsService = inject(StatsService);
  private readonly cdr = inject(ChangeDetectorRef);
  
  stats?: AdminStats;
  loading = true;
  error = '';

  label(s: string) { return STATUS_LABELS[s as OrderStatus] ?? s; }

  // Computes the percentage of total orders for a given status (used for progress bars)
  pct(count: number) {
    return this.stats?.orders ? Math.round((count / this.stats.orders) * 100) : 0;
  }

  ngOnInit(): void {
  this.statsService.getAdminStats().subscribe({
    next: (stats) => {
      this.stats = stats;
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
}
