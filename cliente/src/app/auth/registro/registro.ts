import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  mensajeError = signal<string | null>(null);

  formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registrarse(): void {
    if (this.formulario.invalid) {
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);

    const { nombre, email, password } = this.formulario.getRawValue();

    this.authService.registro({
      nombre: nombre!,
      email: email!,
      password: password!
    }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.error?.error) {
          this.mensajeError.set(err.error.error);
        } else {
          this.mensajeError.set('Error al registrar usuario');
        }
      }
    });
  }
}

