import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PublicacionService } from '../../services/publicacion';
import { Categoria } from '../../models/categoria';
import { CATEGORIAS } from '../../data/categorias';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';


@Component({
  selector: 'app-crear-publicacion',
  imports: [ReactiveFormsModule, Sidebar],
  templateUrl: './crear-publicacion.html',
  styleUrl: './crear-publicacion.css'
})

export class CrearPublicacion implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private publicacionService = inject(PublicacionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  categorias: Categoria[] = CATEGORIAS;
  mensajeError = '';

  publicacionForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5)]],
    contenido: ['', [Validators.required, Validators.minLength(10)]],
    categoriaId: [0, [Validators.required, Validators.min(1)]]
  });

  modoEdicion = false;
  publicacionId: number | null = null;

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const idParametro = this.route.snapshot.paramMap.get('id');

    if (idParametro === null) {
      return;
    }

    const id = Number(idParametro);

    if (!Number.isInteger(id) || id <= 0) {
      this.mensajeError = 'Identificador de publicación inválido.';
      return;
    }

    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.publicacionService.buscarPorId(id).subscribe({
      next: (publicacion) => {
        if (!publicacion || publicacion.usuarioId !== usuario.id) {
          this.mensajeError =
            'No tienes permiso para editar esta publicación.';
          return;
        }

        this.modoEdicion = true;
        this.publicacionId = publicacion.id;

        this.publicacionForm.patchValue({
          titulo: publicacion.titulo,
          contenido: publicacion.contenido,
          categoriaId: publicacion.categoria.id
        });
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar la publicación.';
      }
    });
  }

  campoInvalido(nombreCampo: string): boolean {
    const control = this.publicacionForm.get(nombreCampo);

    return !!(control && control.invalid && control.touched);
  }

  crearPublicacion(): void {
    if (this.publicacionForm.invalid) {
      this.publicacionForm.markAllAsTouched();
      return;
    }

    this.mensajeError = '';

    const usuario = this.authService.obtenerUsuarioActual();

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    const valores = this.publicacionForm.getRawValue();

    const categoria = this.categorias.find(
      item => item.id === valores.categoriaId
    );

    if (!categoria) {
      this.mensajeError = 'Selecciona una categoría válida.';
      return;
    }

    if (this.modoEdicion) {
      if (this.publicacionId === null) {
        this.mensajeError = 'No se identificó la publicación que deseas editar.';
        return;
      }

      this.publicacionService.buscarPorId(this.publicacionId).subscribe({
        next: (publicacion) => {
          if (!publicacion || publicacion.usuarioId !== usuario.id) {
            this.mensajeError = 'No tienes permiso para editar esta publicación.';
            return;
          }

          this.publicacionService.actualizar(this.publicacionId!, {
            titulo: valores.titulo?.trim() ?? '',
            contenido: valores.contenido?.trim() ?? '',
            categoria
          }).subscribe({
            next: () => {
              this.router.navigate(['/mis-publicaciones']);
            },
            error: () => {
              this.mensajeError = 'No fue posible actualizar la publicación.';
            }
          });
        },
        error: () => {
          this.mensajeError = 'No fue posible verificar la publicación.';
        }
      });

      return;
    }

    this.publicacionService.crear({
      usuarioId: usuario.id,
      categoria,
      titulo: valores.titulo?.trim() ?? '',
      contenido: valores.contenido?.trim() ?? '',
      baneado: false
    }).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones'], {
          state: {
            mensajeExito: '¡Publicación creada exitosamente!'
          }
        });
      },
      error: (err) => {
        this.mensajeError = err.message;
      }
    });
  }
}
