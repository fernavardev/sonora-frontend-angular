import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
        if (err.status === 401) {
          this.error = 'Correo o contraseña incorrectos.';
        } else {
          this.error = 'No fue posible iniciar sesión. Inténtalo nuevamente.';
        }

        this.cdr.markForCheck();
      }
    });
  }
}
