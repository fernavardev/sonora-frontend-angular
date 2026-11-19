import { Categoria } from './categoria';

export interface Publicacion {
  id: number;
  usuarioId: number;
  categoria: Categoria;
  titulo: string;
  contenido: string;
  baneado: boolean;
}