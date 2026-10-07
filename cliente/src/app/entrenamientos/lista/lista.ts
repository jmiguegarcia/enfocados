import { Component, OnInit, inject, signal } from '@angular/core';
import { Entrenamiento, EntrenamientoService } from '../../servicios/entrenamiento';
import { AuthService } from '../../servicios/auth';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-lista',
  styleUrl: './lista.css',
  templateUrl: './lista.html',
})
export class Lista implements OnInit {
  entrenamientos = signal<Entrenamiento[]>([]);
  cargando = signal<boolean>(true);

  private entrenamientoService = inject(EntrenamientoService);
  protected authService = inject(AuthService);

  ngOnInit(): void {
    this.cargarEntrenamientos();
  }

  cargarEntrenamientos(): void {
    this.cargando.set(true);
    this.entrenamientoService.obtenerEntrenamientos().subscribe({
      next: (data: Entrenamiento[]) => {
        this.entrenamientos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando entrenamientos:', err);
        this.cargando.set(false);
      }
    });
  }

  eliminarEntrenamiento(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este entrenamiento?')) {
      return;
    }

    this.entrenamientoService.eliminarEntrenamiento(id).subscribe(() => {
      this.entrenamientos.update((entrenamientos) =>
        entrenamientos.filter((t) => t.id !== id)
      );
    });
  }
}