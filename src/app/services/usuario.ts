import { Injectable } from '@angular/core';
import { Observable, of, throwError, switchMap, map } from 'rxjs';

import { Usuario } from '../models/usuario';
import { USUARIOS } from '../data/usuarios';
import { RegistroRequest } from '../models/registro-request';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl = '/api/usuarios';

  constructor(private http: HttpClient) { }

  private usuarios: Usuario[] = this.cargarUsuarios();

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Usuario | undefined> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  buscarPorCorreo(correo: string): Observable<Usuario | undefined> {
    return of(
      this.usuarios.find(
        usuario => usuario.correo.toLowerCase() === correo.toLowerCase()
      )
    );
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

  private cargarUsuarios(): Usuario[] {
    if (typeof localStorage === 'undefined') {
      return [...USUARIOS];
    }

    const guardados = localStorage.getItem('sonora_usuarios');

    return guardados ? JSON.parse(guardados) as Usuario[] : [...USUARIOS];
  }

  private guardarUsuarios(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sonora_usuarios', JSON.stringify(this.usuarios));
    }
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
