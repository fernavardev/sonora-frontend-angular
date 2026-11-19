import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { Comentario } from '../models/comentario';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

  private comentarios: Comentario[] = this.cargarComentarios();

  listarPorPublicacion(publicacionId: number): Observable<Comentario[]> {
    return of(
      this.comentarios.filter(
        comentario => comentario.publicacion.id === publicacionId
      )
    );
  }

  crear(datos: Omit<Comentario, 'id'>): Observable<Comentario> {
    const nuevoComentario: Comentario = {
      ...datos,
      id: Math.max(0, ...this.comentarios.map(c => c.id)) + 1
    };

    this.comentarios.push(nuevoComentario);
    this.guardarComentarios();

    return of(nuevoComentario);
  }

  actualizar(
    id: number,
    datos: Partial<Comentario>
  ): Observable<Comentario> {
    const indice = this.comentarios.findIndex(c => c.id === id);

    if (indice === -1) {
      return throwError(() => new Error('Comentario no encontrado.'));
    }

    const comentarioActualizado: Comentario = {
      ...this.comentarios[indice],
      ...datos,
      id
    };

    this.comentarios[indice] = comentarioActualizado;
    this.guardarComentarios();

    return of(comentarioActualizado);
  }

  eliminar(id: number): Observable<void> {
    const indice = this.comentarios.findIndex(c => c.id === id);

    if (indice === -1) {
      return throwError(() => new Error('Comentario no encontrado.'));
    }

    this.comentarios.splice(indice, 1);
    this.guardarComentarios();

    return of(undefined);
  }

  private cargarComentarios(): Comentario[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const guardados = localStorage.getItem('sonora_comentarios');

    return guardados
      ? JSON.parse(guardados) as Comentario[]
      : [];
  }

  private guardarComentarios(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'sonora_comentarios',
        JSON.stringify(this.comentarios)
      );
    }
  }

  eliminarPorPublicacion(publicacionId: number): Observable<void> {
    this.comentarios = this.comentarios.filter(
      comentario => comentario.publicacion.id !== publicacionId
    );

    this.guardarComentarios();

    return of(undefined);
  }

}
