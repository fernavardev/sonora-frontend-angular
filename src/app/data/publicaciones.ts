import { Publicacion } from '../models/publicacion';
import { CATEGORIAS } from './categorias';

export const PUBLICACIONES: Publicacion[] = [
  {
    id: 1,
    usuarioId: 1,
    categoria: CATEGORIAS[0],
    titulo: '¿Qué guitarra eléctrica recomiendan para comenzar?',
    contenido: 'Estoy buscando recomendaciones para elegir mi primera guitarra eléctrica.',
    baneado: false
  },
  {
    id: 2,
    usuarioId: 2,
    categoria: CATEGORIAS[1],
    titulo: 'Consejos para mejorar la técnica de batería',
    contenido: '¿Qué ejercicios recomiendan para mejorar la coordinación y el ritmo?',
    baneado: false
  },
  {
    id: 3,
    usuarioId: 1,
    categoria: CATEGORIAS[3],
    titulo: 'Software para comenzar a producir música',
    contenido: 'Me gustaría conocer sus recomendaciones de programas para grabación y mezcla.',
    baneado: false
  }
];
