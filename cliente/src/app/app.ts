import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './servicios/auth';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Training Tracker');
  protected readonly authService = inject(AuthService);

  cerrarSesion(): void {
    this.authService.logout();
  }

  volverASuperadmin(): void {
    this.authService.volverASuperadmin();
  }
}
