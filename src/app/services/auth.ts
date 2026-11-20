import { Injectable } from '@angular/core';
import { Observable, of, throwError, switchMap, map, tap } from 'rxjs';
import { Usuario } from '../models/usuario';
import { LoginRequest } from '../models/login-request';
import { USUARIOS } from '../data/usuarios';
import { CREDENCIALES, Credencial } from '../data/credenciales';
import { inject } from '@angular/core';
import { UsuarioService } from './usuario';
import { RegistroRequest } from '../models/registro-request';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private credenciales: Credencial[] = this.cargarCredenciales();

  private usuarioActual: Usuario | null = this.cargarSesion();

  private usuarioService = inject(UsuarioService);

  private http = inject(HttpClient);

  login(datos: LoginRequest): Observable<Usuario> {
    const correo = datos.correo.trim().toLowerCase();

    return this.http.post(
      '/api/usuarios/login',
      {
        correo,
        password: datos.password
      },
      { responseType: 'text' }
    ).pipe(
      switchMap(() => this.usuarioService.listar()),
      map(usuarios => {
        const usuario = usuarios.find(
          item => item.correo.toLowerCase() === correo
        );

        if (!usuario) {
          throw new Error('No fue posible recuperar los datos del usuario.');
        }

        this.usuarioActual = usuario;
        this.guardarSesion();

        return usuario;
      })
    );
  }

  private cargarCredenciales(): Credencial[] {
    if (typeof localStorage === 'undefined') {
      return [...CREDENCIALES];
    }

    const guardadas = localStorage.getItem('sonora_credenciales');

    return guardadas
      ? JSON.parse(guardadas) as Credencial[]
      : [...CREDENCIALES];
  }

  private guardarCredenciales(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'sonora_credenciales',
        JSON.stringify(this.credenciales)
      );
    }
  }


  registrar(datos: RegistroRequest): Observable<Usuario> {
    return this.usuarioService.registrar(datos);
  }


  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActual;
  }

  logout(): void {
    this.usuarioActual = null;
    this.guardarSesion();
  }

  private cargarSesion(): Usuario | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    const guardada = sessionStorage.getItem('sonora_sesion');

    return guardada ? JSON.parse(guardada) as Usuario : null;
  }

  private guardarSesion(): void {
    if (typeof sessionStorage !== 'undefined') {
      if (this.usuarioActual) {
        sessionStorage.setItem(
          'sonora_sesion',
          JSON.stringify(this.usuarioActual)
        );
      } else {
        sessionStorage.removeItem('sonora_sesion');
      }
    }
  }

  cambiarPassword(
    passwordActual: string,
    nuevaPassword: string
  ): Observable<boolean> {

    if (!this.usuarioActual) {
      return throwError(() => new Error('Debes iniciar sesión.'));
    }

    if (passwordActual === nuevaPassword) {
      return throwError(() => new Error(
        'La nueva contraseña debe ser diferente a la actual.'
      ));
    }

    const passwordValida =
      nuevaPassword.length >= 6 &&
      nuevaPassword.length <= 18 &&
      /[A-Z]/.test(nuevaPassword) &&
      /\d/.test(nuevaPassword) &&
      /[!@#$%&*._-]/.test(nuevaPassword);

    if (!passwordValida) {
      return throwError(() => new Error(
        'La nueva contraseña no cumple los requisitos de seguridad.'
      ));
    }

    const usuario = this.usuarioActual;

    return this.http.post(
      '/api/usuarios/login',
      {
        correo: usuario.correo,
        password: passwordActual
      },
      { responseType: 'text' }
    ).pipe(
      switchMap(() =>
        this.usuarioService.cambiarPassword(usuario.id, nuevaPassword)
      ),
      map(() => true)
    );
  }

  actualizarSesion(usuarioActualizado: Usuario): void {
    this.usuarioActual = usuarioActualizado;
    this.guardarSesion();
  }
}
