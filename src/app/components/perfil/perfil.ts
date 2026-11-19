import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AuthService } from '../../services/auth';
import { UsuarioService } from '../../services/usuario';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, Sidebar],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);

  usuario = this.authService.obtenerUsuarioActual();

  mensajeExito = '';
  mensajeError = '';

  perfilForm = this.fb.group({
    nombre: [
      this.usuario?.nombre ?? '',
      [Validators.required, Validators.minLength(3)]
    ],
    nickname: [
      this.usuario?.nickname ?? '',
      [Validators.required, Validators.minLength(3)]
    ],
    correo: [
      this.usuario?.correo ?? '',
      [Validators.required, Validators.email]
    ]
  });

  campoInvalido(nombreCampo: string): boolean {
    const control = this.perfilForm.get(nombreCampo);

    return !!(control && control.invalid && control.touched);
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid || !this.usuario) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.mensajeExito = '';
    this.mensajeError = '';

    const valores = this.perfilForm.getRawValue();

    this.usuarioService.actualizar(this.usuario.id, {
      nombre: valores.nombre ?? '',
      nickname: valores.nickname ?? '',
      correo: valores.correo ?? ''
    }).subscribe({
      next: (usuarioActualizado) => {
        this.authService.actualizarSesion(usuarioActualizado);
        this.usuario = usuarioActualizado;
        this.mensajeExito = 'Perfil actualizado correctamente.';
      },
      error: (err) => {
        this.mensajeError = err.message;
      }
    });
  }
}
