import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntrenamientoService } from '../../servicios/entrenamiento';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-editar',
  styleUrl: './editar.css',
  templateUrl: './editar.html',
})
export class Editar implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private entrenamientoService = inject(EntrenamientoService);

  id = 0;

  formulario = this.fb.group({
    fecha: ['', Validators.required],
    tipo: ['', Validators.required],
    duracionMinutos: [0, [Validators.required, Validators.min(1)]],
    notas: [''],
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    console.log('ID del entrenamiento:', this.id);

    this.entrenamientoService.obtenerEntrenamiento(this.id).subscribe({
      next: (t) => {
        console.log('Entrenamiento recibido:', t);
        this.formulario.setValue({
          fecha: t.fecha,
          tipo: t.tipo,
          duracionMinutos: t.duracionMinutos,
          notas: t.notas,
        });
      },
      error: (error) => {
        console.error('Error obteniendo entrenamiento:', error);
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      return;
    }

    const formValue = this.formulario.getRawValue();

    const entrenamientoActualizado = {
      fecha: formValue.fecha ?? '',
      tipo: formValue.tipo ?? '',
      duracionMinutos: Number(formValue.duracionMinutos),
      notas: formValue.notas ?? '',
    };

    this.entrenamientoService
      .actualizarEntrenamiento(this.id, entrenamientoActualizado)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}