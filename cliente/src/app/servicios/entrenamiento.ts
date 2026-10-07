import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Entrenamiento {
  id: number;
  fecha: string;
  tipo: string;
  duracionMinutos: number;
  notas: string;
  oculto?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EntrenamientoService {
  private apiUrl = 'http://localhost:3000/api/entrenamientos';
  private http = inject(HttpClient);

  obtenerEntrenamientos(): Observable<Entrenamiento[]> {
    return this.http.get<Entrenamiento[]>(this.apiUrl);
  }

  crearEntrenamiento(entrenamiento: Omit<Entrenamiento, 'id'>): Observable<Entrenamiento> {
    return this.http.post<Entrenamiento>(this.apiUrl, entrenamiento);
  }

  actualizarEntrenamiento(
    id: number,
    entrenamiento: Partial<Omit<Entrenamiento, 'id'>>
  ): Observable<Entrenamiento> {
    return this.http.put<Entrenamiento>(`${this.apiUrl}/${id}`, entrenamiento);
  }

  eliminarEntrenamiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  obtenerEntrenamiento(id: number): Observable<Entrenamiento> {
    return this.http.get<Entrenamiento>(`${this.apiUrl}/${id}`);
  }
}