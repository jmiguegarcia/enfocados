import { Component, OnInit, inject, signal } from '@angular/core';
import { Entrenamiento, EntrenamientoService } from '../../servicios/entrenamiento';
import { RouterLink } from '@angular/router';
    
@Component({
  imports: [RouterLink],
  selector: 'app-lista',
  styleUrl: './lista.css',
  templateUrl: './lista.html',
})
export class Lista implements OnInit {
  entrenamientos = signal<Entrenamiento[]>([]);

  private entrenamientoService = inject(EntrenamientoService);

  ngOnInit(): void {
    this.entrenamientoService.obtenerEntrenamientos().subscribe((data: Entrenamiento[]) => {
      this.entrenamientos.set(data);
    });
  }
  eliminarEntrenamiento(id: number): void {
    this.entrenamientoService.eliminarEntrenamiento(id).subscribe(() => {
      this.entrenamientos.update((entrenamientos) =>
        entrenamientos.filter((t) => t.id !== id)
      );
    });
  }      
}