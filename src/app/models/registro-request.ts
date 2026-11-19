export interface RegistroRequest {
  nombre: string;
  nickname: string;
  correo: string;
  password: string;
  rol: 'USUARIO' | 'ADMIN';
}