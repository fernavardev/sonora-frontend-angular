
import { Publicacion } from './publicacion';

export interface Comentario {
  id: number;
  publicacion: Publicacion;
  nicknameAutor: string;
  contenido: string;
  baneado: boolean;
  usuarioId: number;
}
