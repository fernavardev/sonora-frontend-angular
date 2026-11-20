import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Publicacion } from '../../models/publicacion';
import { PublicacionService } from '../../services/publicacion';
import { UsuarioService } from '../../services/usuario';
import { Comentario } from '../../models/comentario';
import { ComentarioService } from '../../services/comentario';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Usuario } from '../../models/usuario';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-detalle-publicacion',
  imports: [ReactiveFormsModule, Sidebar],
  templateUrl: './detalle-publicacion.html',
  styleUrl: './detalle-publicacion.css'
})
export class DetallePublicacion implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionService = inject(PublicacionService);
  private usuarioService = inject(UsuarioService);
  private comentarioService = inject(ComentarioService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  publicacion: Publicacion | null = null;
  nicknameAutor = '';
  mensajeError = '';
  comentarios: Comentario[] = [];
  mensajeErrorComentarios = '';
  mensajeErrorCrearComentario = '';
  usuarioActual: Usuario | null = null;
  comentarioEnEdicionId: number | null = null;
  mensajeErrorEditarComentario = '';

  edicionComentarioForm = this.fb.group({
    contenido: ['', [Validators.required, Validators.minLength(2)]]
  });

  comentarioForm = this.fb.group({
    contenido: ['', [Validators.required, Validators.minLength(2)]]
  });


  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.mensajeError = 'Identificador de publicación inválido.';
      return;
    }

    this.publicacionService.buscarPorId(id).subscribe({
      next: (publicacion) => {
        if (!publicacion || publicacion.baneado) {
          this.mensajeError = 'Publicación no encontrada.';
          this.cdr.markForCheck();
          return;
        }

        this.publicacion = publicacion;
        this.cargarComentarios(publicacion.id);

        this.cdr.markForCheck();

        this.usuarioService.buscarPorId(publicacion.usuarioId).subscribe({
          next: (usuario) => {
            this.nicknameAutor = usuario?.nickname ?? 'Usuario desconocido';
            this.cdr.markForCheck();
          },
          error: () => {
            this.nicknameAutor = 'Usuario desconocido';
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar la publicación.';
        this.cdr.markForCheck();
      }
    });
  }


  volver(): void {
    this.router.navigate(['/publicaciones']);
  }

  cargarComentarios(publicacionId: number): void {
    this.comentarioService.listarPorPublicacion(publicacionId).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios.filter(
          comentario => !comentario.baneado
        );

        this.mensajeErrorComentarios = '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeErrorComentarios =
          'No fue posible cargar los comentarios.';
        this.cdr.markForCheck();
      }
    });
  }

  crearComentario(): void {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    this.mensajeErrorCrearComentario = '';

    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.publicacion) {
      this.mensajeErrorCrearComentario =
        'No se encontró la publicación.';
      return;
    }

    const contenido = this.comentarioForm.value.contenido?.trim() ?? '';

    if (contenido.length < 2) {
      this.mensajeErrorCrearComentario =
        'El comentario debe tener al menos 2 caracteres.';
      return;
    }

    this.comentarioService.crear({
      publicacion: this.publicacion,
      nicknameAutor: usuario.nickname,
      contenido,
      baneado: false
    })
      .subscribe({
        next: () => {
          this.comentarioForm.reset();
          this.cargarComentarios(this.publicacion!.id);
        },
        error: (err) => {
          this.mensajeErrorCrearComentario =
            err.message ?? 'No fue posible publicar el comentario.';
        }
      });
  }

  puedeAdministrarComentario(comentario: Comentario): boolean {
    if (!this.usuarioActual) {
      return false;
    }

    const esAutor =
      comentario.nicknameAutor === this.usuarioActual.nickname;

    const esAdministrador = this.usuarioActual.rol === 'ADMIN';

    return esAutor || esAdministrador;
  }

  iniciarEdicionComentario(comentario: Comentario): void {
    if (!this.puedeAdministrarComentario(comentario)) {
      return;
    }

    this.comentarioEnEdicionId = comentario.id;
    this.mensajeErrorEditarComentario = '';

    this.edicionComentarioForm.setValue({
      contenido: comentario.contenido
    });
  }

  guardarEdicionComentario(): void {
    if (this.edicionComentarioForm.invalid) {
      this.edicionComentarioForm.markAllAsTouched();
      return;
    }

    const comentario = this.comentarios.find(
      c => c.id === this.comentarioEnEdicionId
    );

    if (!comentario || !this.puedeAdministrarComentario(comentario)) {
      this.mensajeErrorEditarComentario =
        'No tienes permiso para editar este comentario.';
      return;
    }

    const contenido =
      this.edicionComentarioForm.value.contenido?.trim() ?? '';

    if (contenido.length < 2) {
      this.mensajeErrorEditarComentario =
        'El comentario debe tener al menos 2 caracteres.';
      return;
    }

    this.comentarioService.actualizar(comentario.id, {
      ...comentario,
      contenido
    }).subscribe({
      next: () => {
        this.cancelarEdicionComentario();

        if (this.publicacion) {
          this.cargarComentarios(this.publicacion.id);
        }
      },
      error: (err) => {
        this.mensajeErrorEditarComentario =
          err.message ?? 'No fue posible editar el comentario.';
      }
    });
  }

  cancelarEdicionComentario(): void {
    this.comentarioEnEdicionId = null;
    this.mensajeErrorEditarComentario = '';
    this.edicionComentarioForm.reset();
  }

  eliminarComentario(comentario: Comentario): void {
    if (!this.puedeAdministrarComentario(comentario)) {
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que deseas eliminar este comentario?'
    );

    if (!confirmar) {
      return;
    }

    this.comentarioService.eliminar(comentario.id).subscribe({
      next: () => {
        if (this.publicacion) {
          this.cargarComentarios(this.publicacion.id);
        }
      },
      error: (err) => {
        this.mensajeErrorComentarios =
          err.message ?? 'No fue posible eliminar el comentario.';
      }
    });
  }
}
