import { Injectable } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';

import { Usuario } from '../models/usuario';
import { RegistroRequest } from '../models/registro-request';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl = '/api/usuarios';

  constructor(private http: HttpClient) { }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Usuario | undefined> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  registrar(datos: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, {
      ...datos,
      nombre: datos.nombre.trim(),
      nickname: datos.nickname.trim(),
      correo: datos.correo.trim().toLowerCase(),
      rol: 'USUARIO'
    });
  }

  actualizar(id: number, datos: Partial<Usuario>): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
      switchMap(usuarioActual => {
        return this.http.put<Usuario>(`${this.apiUrl}/${id}`, {
          nombre: (datos.nombre ?? usuarioActual.nombre).trim(),
          nickname: (datos.nickname ?? usuarioActual.nickname).trim(),
          correo: (datos.correo ?? usuarioActual.correo).trim().toLowerCase(),
          rol: usuarioActual.rol
        });
      })
    );
  }

  cambiarPassword(id: number, nuevaPassword: string): Observable<Usuario> {
    return this.buscarPorId(id).pipe(
      switchMap(usuario => {
        if (!usuario) {
          throw new Error('Usuario no encontrado.');
        }

        return this.http.put<Usuario>(`${this.apiUrl}/${id}`, {
          nombre: usuario.nombre,
          nickname: usuario.nickname,
          correo: usuario.correo,
          rol: usuario.rol,
          password: nuevaPassword
        });
      })
    );
  }

  nicknameDisponible(
    nickname: string,
    usuarioId?: number
  ): Observable<boolean> {
    const nicknameNormalizado = nickname.trim().toLowerCase();

    return this.listar().pipe(
      map(usuarios =>
        !usuarios.some(usuario =>
          usuario.nickname.trim().toLowerCase() === nicknameNormalizado &&
          usuario.id !== usuarioId
        )
      )
    );
  }

}
