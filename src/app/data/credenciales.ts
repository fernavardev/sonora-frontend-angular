export interface Credencial {
  correo: string;
  password: string;
}

export const CREDENCIALES: Credencial[] = [
  { correo: 'fernando@sonora.cl', password: 'Sonora123!' },
  { correo: 'camila@sonora.cl', password: 'Sonora123!' },
  { correo: 'admin@sonora.cl', password: 'Sonora123!' }
];
