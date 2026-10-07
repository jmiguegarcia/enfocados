import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../servicios/auth';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cargando = signal(false);
  mensajeError = signal<string | null>(null);

  formulario = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  cargarCredencialesPrueba(email: string): void {
    this.formulario.patchValue({
      email,
      password: '123456'
    });
    this.mensajeError.set(null);
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) {
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set(null);

    const { email, password } = this.formulario.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.cargando.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.error?.error) {
          this.mensajeError.set(err.error.error);
        } else {
          this.mensajeError.set('Error de conexión o credenciales incorrectas');
        }
      }
    });
  }
}

