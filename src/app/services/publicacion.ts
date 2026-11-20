import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { Publicacion } from '../models/publicacion';
import { PUBLICACIONES } from '../data/publicaciones';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private publicaciones: Publicacion[] = this.cargarPublicaciones();

  private readonly apiUrl = '/api/publicaciones';

  constructor(private http: HttpClient) { }

  listar(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Publicacion | undefined> {
    return this.http.get<Publicacion>(
      `${this.apiUrl}/${id}`
    );
  }

  listarPorCategoria(categoriaId: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(
      `${this.apiUrl}/categoria/${categoriaId}`
    );
  }

  crear(datos: Omit<Publicacion, 'id'>): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.apiUrl, datos);
  }

  actualizar(id: number, datos: Partial<Publicacion>): Observable<Publicacion> {
    return this.http.put<Publicacion>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  private cargarPublicaciones(): Publicacion[] {
    if (typeof localStorage === 'undefined') {
      return [...PUBLICACIONES];
    }

    const guardadas = localStorage.getItem('sonora_publicaciones');

    return guardadas
      ? JSON.parse(guardadas) as Publicacion[]
      : [...PUBLICACIONES];
  }

  private guardarPublicaciones(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'sonora_publicaciones',
        JSON.stringify(this.publicaciones)
      );
    }
  }
}
