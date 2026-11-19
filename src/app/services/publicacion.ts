import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { Publicacion } from '../models/publicacion';
import { PUBLICACIONES } from '../data/publicaciones';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private publicaciones: Publicacion[] = this.cargarPublicaciones();

  listar(): Observable<Publicacion[]> {
    return of([...this.publicaciones]);
  }

  buscarPorId(id: number): Observable<Publicacion | undefined> {
    return of(this.publicaciones.find(publicacion => publicacion.id === id));
  }

  listarPorCategoria(categoriaId: number): Observable<Publicacion[]> {
    return of(this.publicaciones.filter(
      publicacion => publicacion.categoria.id === categoriaId
    ));
  }

  crear(datos: Omit<Publicacion, 'id'>): Observable<Publicacion> {
    const nuevaPublicacion: Publicacion = {
      ...datos,
      id: Math.max(0, ...this.publicaciones.map(p => p.id)) + 1
    };

    this.publicaciones.push(nuevaPublicacion);
    this.guardarPublicaciones();

    return of(nuevaPublicacion);
  }

  actualizar(id: number, datos: Partial<Publicacion>): Observable<Publicacion> {
    const indice = this.publicaciones.findIndex(p => p.id === id);

    if (indice === -1) {
      return throwError(() => new Error('Publicación no encontrada'));
    }

    const publicacionActualizada: Publicacion = {
      ...this.publicaciones[indice],
      ...datos,
      id
    };

    this.publicaciones[indice] = publicacionActualizada;
    this.guardarPublicaciones();

    return of(publicacionActualizada);
  }

  eliminar(id: number): Observable<void> {
    const indice = this.publicaciones.findIndex(p => p.id === id);

    if (indice === -1) {
      return throwError(() => new Error('Publicación no encontrada'));
    }

    this.publicaciones.splice(indice, 1);
    this.guardarPublicaciones();

    return of(undefined);
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
