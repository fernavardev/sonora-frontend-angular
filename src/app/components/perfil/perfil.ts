import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';


import { AuthService } from '../../services/auth';
import { UsuarioService } from '../../services/usuario';
import { Sidebar } from '../sidebar/sidebar';
import { switchMap, throwError } from 'rxjs';

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
  private cdr = inject(ChangeDetectorRef);

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

  mensajeExitoPassword = '';
  mensajeErrorPassword = '';

  passwordForm = this.fb.group(
    {
      passwordActual: ['', [Validators.required]],
      nuevaPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(18),
          passwordSeguraValidator()
        ]
      ],
      repetirPassword: ['', [Validators.required]]
    },
    {
      validators: [passwordsIgualesValidator()]
    }
  );

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

    this.usuarioService.nicknameDisponible(
      valores.nickname ?? '',
      this.usuario.id
    ).pipe(
      switchMap(disponible => {
        if (!disponible) {
          return throwError(() => new Error(
            'El nickname ya está en uso. Elige otro.'
          ));
        }

        return this.usuarioService.actualizar(this.usuario!.id, {
          nombre: valores.nombre ?? '',
          nickname: valores.nickname ?? '',
          correo: valores.correo ?? ''
        });
      })
    ).subscribe({
      next: (usuarioActualizado) => {
        this.authService.actualizarSesion(usuarioActualizado);
        this.usuario = usuarioActualizado;
        this.mensajeExito = 'Perfil actualizado correctamente.';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.message ===
          'El nickname ya está en uso. Elige otro.'
          ? err.message
          : err.error?.message ||
          'No fue posible actualizar el perfil.';

        this.cdr.markForCheck();
      }
    });
  }

  campoPasswordInvalido(nombreCampo: string): boolean {
    const control = this.passwordForm.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  cambiarPassword(): void {
    this.mensajeExitoPassword = '';
    this.mensajeErrorPassword = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const valores = this.passwordForm.getRawValue();

    this.authService.cambiarPassword(
      valores.passwordActual ?? '',
      valores.nuevaPassword ?? ''
    ).subscribe({
      next: () => {
        this.mensajeExitoPassword = 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeErrorPassword = err.status === 401
          ? 'La contraseña actual es incorrecta.'
          : err.message === 'La nueva contraseña debe ser diferente a la actual.'
            ? err.message
            : err.message === 'La nueva contraseña no cumple los requisitos de seguridad.'
              ? err.message
              : 'No fue posible actualizar la contraseña.';

        this.cdr.markForCheck();
      }
    });
  }

}


function passwordSeguraValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value || '';

    if (!valor) return null;

    const tieneMayuscula = /[A-Z]/.test(valor);
    const tieneNumero = /\d/.test(valor);
    const tieneEspecial = /[!@#$%&*._-]/.test(valor);

    return tieneMayuscula && tieneNumero && tieneEspecial
      ? null
      : { passwordSegura: true };
  };
}

function passwordsIgualesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nuevaPassword = control.get('nuevaPassword')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;

    return nuevaPassword === repetirPassword
      ? null
      : { passwordsDistintas: true };
  };
}

