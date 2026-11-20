import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css'
})
export class RecuperarPassword {

  private fb = inject(FormBuilder);

  solicitudEnviada = false;

  correoForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  solicitarRecuperacion(): void {
    if (this.correoForm.invalid) {
      this.correoForm.markAllAsTouched();
      return;
    }

    this.solicitudEnviada = true;
  }
}
