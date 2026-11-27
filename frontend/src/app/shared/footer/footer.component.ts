/**
 * footer.component.ts — Site Footer Component
 *
 * Displays the brand name and dynamic copyright year at the bottom of every page.
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}