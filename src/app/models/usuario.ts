export interface Usuario {
  id: number;
  nombre: string;
  nickname: string;
  correo: string;
  rol: 'USUARIO' | 'ADMIN';
}