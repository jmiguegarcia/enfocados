import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario, RolUsuario } from '../modelos/usuario';
import { UsuarioService } from '../servicios/usuario';
import { AuthService } from '../servicios/auth';

@Component({
  imports: [FormsModule],
  selector: 'app-usuarios',
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  usuarios = signal<Usuario[]>([]);
  cargando = signal<boolean>(false);
  mensajeInfo = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  // Control del menú kebab desplegable
  menuAbiertoId = signal<number | null>(null);

  // Formulario para crear usuario
  mostrarCrearModal = signal<boolean>(false);
  nuevoNombre = signal<string>('');
  nuevoEmail = signal<string>('');
  nuevoPassword = signal<string>('');
  nuevoRol = signal<RolUsuario>('student');

  @HostListener('document:click')
  cerrarMenuAlHacerClicFuera(): void {
    this.menuAbiertoId.set(null);
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajeError.set(err.error?.error || 'Error al cargar los usuarios');
      }
    });
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    const usuario = this.usuarios().find((u) => u.id === id);
    if (usuario?.rol === 'superadmin') {
      return;
    }
    this.menuAbiertoId.update((actual) => (actual === id ? null : id));
  }

  toggleTemporaryAssistant(usuario: Usuario): void {
    this.menuAbiertoId.set(null);
    const nuevoValor = !usuario.temporary_assistant;

    this.usuarioService.toggleTemporaryAssistant(usuario.id, nuevoValor).subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) =>
          lista.map((u) => (u.id === actualizado.id ? { ...u, temporary_assistant: actualizado.temporary_assistant } : u))
        );
        this.mensajeInfo.set(
          `Permisos de asistente temporal ${nuevoValor ? 'concedidos a' : 'revocados para'} ${usuario.nombre}`
        );
        setTimeout(() => this.mensajeInfo.set(null), 3000);
      },
      error: (err) => {
        this.mensajeError.set(err.error?.error || 'Error al modificar permisos temporales');
        setTimeout(() => this.mensajeError.set(null), 4000);
      }
    });
  }

  toggleActivo(usuario: Usuario): void {
    this.menuAbiertoId.set(null);
    const nuevoValor = !usuario.activo;

    this.usuarioService.toggleActivo(usuario.id, nuevoValor).subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) =>
          lista.map((u) => (u.id === actualizado.id ? { ...u, activo: actualizado.activo } : u))
        );
        this.mensajeInfo.set(
          `Cuenta de ${usuario.nombre} ${nuevoValor ? 'activada' : 'desactivada'} correctamente`
        );
        setTimeout(() => this.mensajeInfo.set(null), 3000);
      },
      error: (err) => {
        this.mensajeError.set(err.error?.error || 'Error al cambiar estado de cuenta');
        setTimeout(() => this.mensajeError.set(null), 4000);
      }
    });
  }

  impersonar(usuario: Usuario): void {
    this.menuAbiertoId.set(null);
    this.authService.impersonar(usuario.id).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.mensajeError.set(err.error?.error || 'Error al impersonar usuario');
        setTimeout(() => this.mensajeError.set(null), 4000);
      }
    });
  }

  puedeModificarActivo(usuario: Usuario): boolean {
    const currentUser = this.authService.usuario();
    if (!currentUser) return false;
    if (currentUser.id === usuario.id) return false; // No auto-desactivarse
    if (currentUser.rol === 'superadmin') return true;
    if (currentUser.rol === 'head_coach' && usuario.rol === 'student') return true;
    return false;
  }

  crearUsuario(): void {
    if (!this.nuevoNombre() || !this.nuevoEmail() || !this.nuevoPassword()) {
      this.mensajeError.set('Completa todos los campos obligatorios');
      return;
    }

    this.usuarioService.crearUsuario({
      nombre: this.nuevoNombre(),
      email: this.nuevoEmail(),
      password: this.nuevoPassword(),
      rol: this.nuevoRol()
    }).subscribe({
      next: (nuevo) => {
        this.usuarios.update((lista) => [...lista, nuevo]);
        this.mostrarCrearModal.set(false);
        this.nuevoNombre.set('');
        this.nuevoEmail.set('');
        this.nuevoPassword.set('');
        this.mensajeInfo.set(`Usuario ${nuevo.nombre} creado correctamente`);
        setTimeout(() => this.mensajeInfo.set(null), 3000);
      },
      error: (err) => {
        this.mensajeError.set(err.error?.error || 'Error al crear usuario');
        setTimeout(() => this.mensajeError.set(null), 4000);
      }
    });
  }
}
