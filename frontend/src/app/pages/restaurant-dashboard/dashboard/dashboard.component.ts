import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
  stats?: RestaurantStats;
  loading = true;
  error = '';

  ngOnInit() {
    this.statsService.getRestaurantStats().subscribe({
      next: (s) => { this.stats = s; this.loading = false; },
      error: (e) => { this.error = e.error?.message || 'Erreur de chargement'; this.loading = false; },
    });
  }
}
