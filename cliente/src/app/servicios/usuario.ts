import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../modelos/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/usuarios';

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crearUsuario(datos: Partial<Usuario> & { password?: string }): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, datos);
  }

  toggleTemporaryAssistant(id: number, temporary_assistant: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/temporary-assistant`, {
      temporary_assistant
    });
  }

  toggleActivo(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/activo`, {
      activo
    });
  }
}

