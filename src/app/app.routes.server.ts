import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'publicaciones',
    renderMode: RenderMode.Client
  },
  {
    path: 'categorias',
    renderMode: RenderMode.Client
  },
  {
    path: 'publicaciones/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'editar-publicacion/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
