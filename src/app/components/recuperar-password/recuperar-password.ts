import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-password',
  imports: [ReactiveFormsModule],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css'
})
export class RecuperarPassword {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  correoVerificado = false;
  recuperacionExitosa = false;
  mensajeError = '';

  correoForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(18),
          passwordSeguraValidator()
        ]
      ],
      repetirPassword: ['', Validators.required]
    },
    {
      validators: [passwordsIgualesValidator()]
    }
  );

  verificarCorreo(): void {
    if (this.correoForm.invalid) return;

    this.mensajeError = '';
    this.correoVerificado = false;

    const correo = this.correoForm.value.correo ?? '';

    this.authService.verificarCorreo(correo).subscribe({
      next: (existe) => {
        if (existe) {
          this.correoVerificado = true;
        } else {
          this.mensajeError = 'El correo no está registrado.';
        }
      }
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid || !this.correoVerificado) return;

    this.mensajeError = '';

    const correo = this.correoForm.value.correo ?? '';
    const nuevaPassword = this.passwordForm.value.password ?? '';

    this.authService.recuperarPassword(correo, nuevaPassword).subscribe({
      next: (actualizada) => {
        if (actualizada) {
          this.recuperacionExitosa = true;
          this.correoVerificado = false;
          this.passwordForm.reset();
        } else {
          this.mensajeError = 'No fue posible actualizar la contraseña.';
        }
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
