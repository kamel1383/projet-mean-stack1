import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../../core/services/stats.service';
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
  private cdr = inject(ChangeDetectorRef);
  stats?: RestaurantStats;
  loading = true;
  error = '';

  ngOnInit(): void {
  this.statsService.getRestaurantStats().subscribe({
    next: (stats) => {
      this.stats = stats;
      this.loading = false;
      this.cdr.markForCheck();
    },
    error: (err) => {
      this.error = err.error?.message || 'Erreur de chargement des statistiques';
      this.loading = false;
      this.cdr.markForCheck();
    },
  });
}
}
