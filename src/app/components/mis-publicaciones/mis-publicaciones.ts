import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Publicacion } from '../../models/publicacion';
import { PublicacionService } from '../../services/publicacion';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { ComentarioService } from '../../services/comentario';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-mis-publicaciones',
  imports: [RouterLink, Sidebar],
  templateUrl: './mis-publicaciones.html',
  styleUrl: './mis-publicaciones.css'
})
export class MisPublicaciones implements OnInit {
  private publicacionService = inject(PublicacionService);
  private authService = inject(AuthService);
  private comentarioService = inject(ComentarioService);
  private cdr = inject(ChangeDetectorRef);

  publicaciones: Publicacion[] = [];
  mensajeError = '';

  ngOnInit(): void {
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones(): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.mensajeError = 'Debes iniciar sesión para ver tus publicaciones.';
      this.cdr.markForCheck();
      return;
    }

    this.publicacionService.listar().subscribe({
      next: (publicaciones) => {
        this.publicaciones = publicaciones.filter(
          publicacion =>
            publicacion.usuarioId === usuario.id &&
            !publicacion.baneado
        );

        this.mensajeError = '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar tus publicaciones.';
        this.cdr.markForCheck();
      }
    });
  }

  eliminarPublicacion(publicacion: Publicacion): void {
    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario || publicacion.usuarioId !== usuario.id) {
      this.mensajeError = 'No tienes permiso para eliminar esta publicación.';
      return;
    }

    const confirmado = confirm(
      `¿Estás seguro de que deseas eliminar la publicación "${publicacion.titulo}"?`
    );

    if (!confirmado) {
      return;
    }

    this.publicacionService.buscarPorId(publicacion.id).subscribe({
      next: (publicacionExistente) => {
        if (
          !publicacionExistente ||
          publicacionExistente.usuarioId !== usuario.id
        ) {
          this.mensajeError = 'No tienes permiso para eliminar esta publicación.';
          return;
        }

        this.comentarioService.eliminarPorPublicacion(publicacion.id).subscribe({
          next: () => {
            this.publicacionService.eliminar(publicacion.id).subscribe({
              next: () => {
                this.cargarMisPublicaciones();
              },
              error: () => {
                this.mensajeError = 'No fue posible eliminar la publicación.';
              }
            });
          },
          error: () => {
            this.mensajeError = 'No fue posible eliminar los comentarios asociados.';
          }
        });

      },
      error: () => {
        this.mensajeError = 'No fue posible verificar la publicación.';
      }
    });
  }
}
