
import { Usuario } from '../models/usuario';

export const USUARIOS: Usuario[] = [
  {
    id: 1,
    nombre: 'Fernando',
    nickname: 'guitarrista_pro',
    correo: 'fernando@sonora.cl',
    rol: 'USUARIO'
  },
  {
    id: 2,
    nombre: 'Camila',
    nickname: 'baterista',
    correo: 'camila@sonora.cl',
    rol: 'USUARIO'
  },
  {
    id: 3,
    nombre: 'Administrador',
    nickname: 'admin',
    correo: 'admin@sonora.cl',
    rol: 'ADMIN'
  }
];
