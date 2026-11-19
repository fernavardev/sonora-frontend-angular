import { Injectable } from '@angular/core';
import { Observable, of, throwError, switchMap, map, tap } from 'rxjs';
import { Usuario } from '../models/usuario';
import { LoginRequest } from '../models/login-request';
import { USUARIOS } from '../data/usuarios';
import { CREDENCIALES, Credencial } from '../data/credenciales';
import { inject } from '@angular/core';
import { UsuarioService } from './usuario';
import { RegistroRequest } from '../models/registro-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private credenciales: Credencial[] = this.cargarCredenciales();

  private usuarioActual: Usuario | null = this.cargarSesion();

  private usuarioService = inject(UsuarioService);

  login(datos: LoginRequest): Observable<Usuario> {
    const correo = datos.correo.trim().toLowerCase();

    const credencial = this.credenciales.find(
      c => c.correo.toLowerCase() === correo &&
        c.password === datos.password
    );

    if (!credencial) {
      return throwError(() => new Error('Correo o contraseña incorrectos'));
    }

    return of(correo).pipe(
      switchMap(correoValidado =>
        this.usuarioService.buscarPorCorreo(correoValidado)
      ),
      map(usuario => {
        if (!usuario) {
          throw new Error('Usuario no encontrado');
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
    return this.usuarioService.registrar(datos).pipe(
      tap(usuario => {
        this.credenciales.push({
          correo: usuario.correo,
          password: datos.password
        });

        this.guardarCredenciales();
      })
    );
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

  verificarCorreo(correo: string): Observable<boolean> {
    const correoNormalizado = correo.trim().toLowerCase();

    const existe = this.credenciales.some(
      credencial => credencial.correo.toLowerCase() === correoNormalizado
    );

    return of(existe);
  }

  recuperarPassword(
    correo: string,
    nuevaPassword: string
  ): Observable<boolean> {
    const correoNormalizado = correo.trim().toLowerCase();

    const credencial = this.credenciales.find(
      item => item.correo.toLowerCase() === correoNormalizado
    );

    if (!credencial) {
      return of(false);
    }

    credencial.password = nuevaPassword;
    this.guardarCredenciales();

    return of(true);
  }

  cambiarPassword(
    passwordActual: string,
    nuevaPassword: string
  ): Observable<boolean> {

    if (!this.usuarioActual) {
      return throwError(() => new Error('Debes iniciar sesión.'));
    }

    const credencial = this.credenciales.find(
      item =>
        item.correo.toLowerCase() ===
        this.usuarioActual!.correo.toLowerCase()
    );

    if (!credencial) {
      return throwError(() => new Error('Credenciales no encontradas.'));
    }

    if (credencial.password !== passwordActual) {
      return throwError(() => new Error('La contraseña actual es incorrecta.'));
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

    credencial.password = nuevaPassword;
    this.guardarCredenciales();

    return of(true);
  }

  actualizarSesion(usuarioActualizado: Usuario): void {
    const correoAnterior = this.usuarioActual?.correo;

    if (correoAnterior && correoAnterior !== usuarioActualizado.correo) {
      const credencial = this.credenciales.find(
        item => item.correo.toLowerCase() === correoAnterior.toLowerCase()
      );

      if (credencial) {
        credencial.correo = usuarioActualizado.correo;
        this.guardarCredenciales();
      }
    }

    this.usuarioActual = usuarioActualizado;
    this.guardarSesion();
  }
}
