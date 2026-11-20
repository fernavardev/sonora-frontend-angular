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
import { RegistroRequest } from '../../models/registro-request';
import { UsuarioService } from '../../services/usuario';
import { switchMap, throwError } from 'rxjs';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private usuarioService = inject(UsuarioService);

  enviado = false;
  registroExitoso = false;
  mensajeError = '';

  registroForm = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      nickname: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: [
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
    const control = this.registroForm.get(nombreCampo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty || this.enviado)
    );
  }

  registrar(): void {
    this.enviado = true;
    this.registroExitoso = false;
    this.mensajeError = '';

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.mensajeError = 'Revisa los campos del formulario.';
      return;
    }

    const valores = this.registroForm.getRawValue();

    const datos: RegistroRequest = {
      nombre: valores.nombre ?? '',
      nickname: valores.nickname ?? '',
      correo: valores.correo ?? '',
      password: valores.password ?? '',
      rol: 'USUARIO'
    };

    this.usuarioService.nicknameDisponible(datos.nickname).pipe(
      switchMap(disponible => {
        if (!disponible) {
          return throwError(() => new Error(
            'El nickname ya está en uso. Elige otro.'
          ));
        }

        return this.authService.registrar(datos);
      })
    ).subscribe({
      next: () => {
        this.registroExitoso = true;
        this.registroForm.reset();
        this.enviado = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.message ===
          'El nickname ya está en uso. Elige otro.'
          ? err.message
          : err.status === 409
            ? 'El correo ya está registrado.'
            : 'No fue posible registrar el usuario.';

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
    const password = control.get('password')?.value;
    const repetirPassword = control.get('repetirPassword')?.value;

    return password === repetirPassword
      ? null
      : { passwordsDistintas: true };
  };
}
