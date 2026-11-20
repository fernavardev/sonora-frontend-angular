import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';

import { Comentario } from '../models/comentario';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

  private http = inject(HttpClient);
  private readonly apiUrl = '/api/comentarios';

  listarPorPublicacion(publicacionId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(
      `${this.apiUrl}/publicacion/${publicacionId}`
    );
  }

  crear(datos: Omit<Comentario, 'id'>): Observable<Comentario> {
    return this.http.post<Comentario>(this.apiUrl, datos);
  }

  actualizar(
    id: number,
    datos: Partial<Comentario>
  ): Observable<Comentario> {
    return this.http.put<Comentario>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  eliminarPorPublicacion(publicacionId: number): Observable<void> {
    return this.listarPorPublicacion(publicacionId).pipe(
      switchMap(comentarios => {
        if (comentarios.length === 0) {
          return of(undefined);
        }

        return forkJoin(
          comentarios.map(comentario => this.eliminar(comentario.id))
        ).pipe(
          map(() => undefined)
        );
      })
    );
  }
}
