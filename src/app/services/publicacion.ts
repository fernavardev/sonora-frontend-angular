import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Publicacion } from '../models/publicacion';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

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

}
