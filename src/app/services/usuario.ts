import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { Usuario } from '../models/usuario';
import { USUARIOS } from '../data/usuarios';
import { RegistroRequest } from '../models/registro-request';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarios: Usuario[] = this.cargarUsuarios();

  listar(): Observable<Usuario[]> {
    return of(this.usuarios);
  }

  buscarPorId(id: number): Observable<Usuario | undefined> {
    return of(this.usuarios.find(usuario => usuario.id === id));
  }

  buscarPorCorreo(correo: string): Observable<Usuario | undefined> {
    return of(
      this.usuarios.find(
        usuario => usuario.correo.toLowerCase() === correo.toLowerCase()
      )
    );
  }

  registrar(datos: RegistroRequest): Observable<Usuario> {
    const correo = datos.correo.trim().toLowerCase();

    if (this.usuarios.some(usuario => usuario.correo.toLowerCase() === correo)) {
      return throwError(() => new Error('El correo ya está registrado'));
    }

    const nuevoUsuario: Usuario = {
      id: Math.max(0, ...this.usuarios.map(usuario => usuario.id)) + 1,
      nombre: datos.nombre,
      nickname: datos.nickname,
      correo,
      rol: 'USUARIO'
    };

    this.usuarios.push(nuevoUsuario);

    this.guardarUsuarios();
    return of(nuevoUsuario);
  }

  actualizar(id: number, datos: Partial<Usuario>): Observable<Usuario> {
    const indice = this.usuarios.findIndex(usuario => usuario.id === id);

    if (indice === -1) {
      return throwError(() => new Error('Usuario no encontrado'));
    }

    if (datos.correo) {
      const correo = datos.correo.trim().toLowerCase();

      if (this.usuarios.some(usuario =>
        usuario.id !== id && usuario.correo.toLowerCase() === correo
      )) {
        return throwError(() => new Error('El correo ya está registrado'));
      }
    }

    const usuarioActualizado: Usuario = {
      ...this.usuarios[indice],
      nombre: datos.nombre ?? this.usuarios[indice].nombre,
      nickname: datos.nickname ?? this.usuarios[indice].nickname,
      correo: datos.correo
        ? datos.correo.trim().toLowerCase()
        : this.usuarios[indice].correo
    };

    this.usuarios[indice] = usuarioActualizado;
    this.guardarUsuarios();

    return of(usuarioActualizado);
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
}
