import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EntrenamientoService } from '../../servicios/entrenamiento';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-formulario',
  styleUrl: './formulario.css',
  templateUrl: './formulario.html',
})
export class Formulario {
  private fb = inject(FormBuilder);
  private entrenamientoService = inject(EntrenamientoService);
  private router = inject(Router);

  formulario = this.fb.group({
    fecha: ['', Validators.required],
    tipo: ['', Validators.required],
    duracionMinutos: [0, [Validators.required, Validators.min(1)]],
    notas: [''],
    oculto: [false]
  });

  guardar(): void {
    if (this.formulario.invalid) {
      return;
    }

    const formValue = this.formulario.getRawValue();

    const nuevoEntrenamiento = {
      fecha: formValue.fecha ?? '',
      tipo: formValue.tipo ?? '',
      duracionMinutos: Number(formValue.duracionMinutos),
      notas: formValue.notas ?? '',
      oculto: Boolean(formValue.oculto)
    };

    this.entrenamientoService.crearEntrenamiento(nuevoEntrenamiento).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}