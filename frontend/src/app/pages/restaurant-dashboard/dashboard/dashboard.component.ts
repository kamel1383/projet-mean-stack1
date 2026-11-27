import { Component, OnInit, effect, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../../core/services/stats.service';
import { RestaurateurContextService } from '../../../core/services/restaurateur-context.service';
import { RestaurantStats } from '../../../core/models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  private ctx = inject(RestaurateurContextService);

  stats?: RestaurantStats;
  loading = true;
  error = '';

  constructor() {
    // Recharge les statistiques automatiquement lorsqu'on change de restaurant actif
    effect(() => {
      const selectedId = this.ctx.selectedRestaurantId();
      if (selectedId) {
        this.loadStats(selectedId);
      }
    });
  }

  ngOnInit() {
    this.loadStats(this.ctx.selectedRestaurantId() || undefined);
  }

  private loadStats(restaurantId?: string) {
    this.loading = true;
    this.statsService.getRestaurantStats(restaurantId).subscribe({
      next: (s) => { this.stats = s; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Erreur de chargement'; this.loading = false; },
    });
  }
}
