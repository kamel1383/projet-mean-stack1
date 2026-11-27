/**
 * app.ts — Root Angular Component
 *
 * Wraps the entire application layout: displays the persistent Navbar at the top,
 * renders the active page inside `<router-outlet>`, and shows the Footer at the bottom.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}