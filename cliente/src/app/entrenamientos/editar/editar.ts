import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntrenamientoService } from '../../servicios/entrenamiento';
import { AuthService } from '../../servicios/auth';

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
  protected authService = inject(AuthService);

  id = 0;

  formulario = this.fb.group({
    fecha: ['', Validators.required],
    tipo: ['', Validators.required],
    duracionMinutos: [0, [Validators.required, Validators.min(1)]],
    notas: [''],
    oculto: [false]
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.entrenamientoService.obtenerEntrenamiento(this.id).subscribe({
      next: (t) => {
        this.formulario.setValue({
          fecha: t.fecha,
          tipo: t.tipo,
          duracionMinutos: t.duracionMinutos,
          notas: t.notas,
          oculto: Boolean(t.oculto)
        });

        // Si es asistente y no puede editar el plan, deshabilitar los campos excepto notas
        if (!this.authService.puedeCrearEditar()) {
          this.formulario.get('fecha')?.disable();
          this.formulario.get('tipo')?.disable();
          this.formulario.get('duracionMinutos')?.disable();
          this.formulario.get('oculto')?.disable();
        }
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
      oculto: Boolean(formValue.oculto)
    };

    this.entrenamientoService
      .actualizarEntrenamiento(this.id, entrenamientoActualizado)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}