import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario, RespuestaAuth } from '../modelos/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';

  token = signal<string | null>(this.obtenerTokenInicial());
  usuario = signal<Usuario | null>(this.obtenerUsuarioInicial());
  estaImpersonando = signal<boolean>(Boolean(localStorage.getItem('admin_token_backup')));

  autenticado = computed(() => Boolean(this.token() && this.usuario()));

  rolActual = computed(() => this.usuario()?.rol || null);

  rolEfectivo = computed(() => {
    const u = this.usuario();
    if (!u) return null;
    if (u.rol === 'student' && u.temporary_assistant) {
      return 'assistant_coach';
    }
    return u.rol;
  });

  esSuperAdmin = computed(() => this.usuario()?.rol === 'superadmin');

  puedeCrearEditar = computed(() => {
    const rol = this.usuario()?.rol;
    return rol === 'superadmin' || rol === 'head_coach';
  });

  puedeVerUsuarios = computed(() => {
    const rol = this.rolEfectivo();
    return rol === 'superadmin' || rol === 'head_coach' || rol === 'assistant_coach';
  });

  puedeToggleTempAssistant = computed(() => {
    const rol = this.rolEfectivo();
    return rol === 'superadmin' || rol === 'head_coach' || rol === 'assistant_coach';
  });

  constructor() {
    if (this.token()) {
      this.verificarSesion().subscribe({
        error: () => this.limpiarSesion()
      });
    }
  }

  private obtenerTokenInicial(): string | null {
    return localStorage.getItem('auth_token');
  }

  private obtenerUsuarioInicial(): Usuario | null {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  login(credenciales: { email: string; password: string }): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((res) => {
        this.guardarSesion(res.token, res.usuario);
      })
    );
  }

  registro(datos: { nombre: string; email: string; password: string }): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.apiUrl}/registro`, datos).pipe(
      tap((res) => {
        this.guardarSesion(res.token, res.usuario);
      })
    );
  }

  verificarSesion(): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        this.usuario.set(res.usuario);
        localStorage.setItem('auth_user', JSON.stringify(res.usuario));
      })
    );
  }

  impersonar(usuarioId: number): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(`${this.apiUrl}/impersonar/${usuarioId}`, {}).pipe(
      tap((res) => {
        // Guardar token original de superadmin si no se ha guardado
        if (!localStorage.getItem('admin_token_backup')) {
          localStorage.setItem('admin_token_backup', this.token()!);
          localStorage.setItem('admin_user_backup', JSON.stringify(this.usuario()!));
        }
        this.guardarSesion(res.token, res.usuario);
        this.estaImpersonando.set(true);
      })
    );
  }

  volverASuperadmin(): void {
    const backupToken = localStorage.getItem('admin_token_backup');
    const backupUser = localStorage.getItem('admin_user_backup');

    if (backupToken && backupUser) {
      try {
        const adminUsuario = JSON.parse(backupUser);
        this.guardarSesion(backupToken, adminUsuario);
      } finally {
        localStorage.removeItem('admin_token_backup');
        localStorage.removeItem('admin_user_backup');
        this.estaImpersonando.set(false);
        this.router.navigate(['/']);
      }
    }
  }

  logout(): void {
    this.limpiarSesion();
    this.router.navigate(['/login']);
  }

  private guardarSesion(token: string, usuario: Usuario): void {
    this.token.set(token);
    this.usuario.set(usuario);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(usuario));
  }

  private limpiarSesion(): void {
    this.token.set(null);
    this.usuario.set(null);
    this.estaImpersonando.set(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('admin_token_backup');
    localStorage.removeItem('admin_user_backup');
  }
}

