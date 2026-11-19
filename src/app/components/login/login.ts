import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  datos: LoginRequest = {
    correo: '',
    password: ''
  };

  error = '';

  iniciarSesion(): void {
    this.error = '';

    this.authService.login(this.datos).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.error = err.message;
      }
    });
  }
}
