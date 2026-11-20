import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { Publicacion } from '../../models/publicacion';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria';
import { PublicacionService } from '../../services/publicacion';
import { UsuarioService } from '../../services/usuario';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-publicaciones',
  imports: [RouterLink, Sidebar],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class Publicaciones implements OnInit {

  private publicacionService = inject(PublicacionService);
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private categoriaService = inject(CategoriaService);

  usuarios = new Map<number, string>();

  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];
  categorias: Categoria[] = [];

  categoriaSeleccionada = 0;
  mensajeError = '';
  mensajeExito = '';

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar las categorías.';
        this.cdr.markForCheck();
      }
    });
    if (typeof history !== 'undefined') {
      this.mensajeExito = history.state?.mensajeExito ?? '';

      if (this.mensajeExito) {
        const estado = { ...history.state };
        delete estado.mensajeExito;

        history.replaceState(estado, '');
      }
    }

    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = new Map(
          usuarios.map(usuario => [usuario.id, usuario.nickname])
        );
      }
    });

    this.cargarPublicaciones();

    this.route.queryParamMap.subscribe(params => {
      const categoriaId = Number(params.get('categoria'));

      if (Number.isInteger(categoriaId) && categoriaId > 0) {
        this.categoriaSeleccionada = categoriaId;
      } else {
        this.categoriaSeleccionada = 0;
      }

      this.filtrarPorCategoria(this.categoriaSeleccionada);
    });
  }

  cargarPublicaciones(): void {
    this.publicacionService.listar().subscribe({
      next: (publicaciones) => {
        this.publicaciones = publicaciones;
        this.filtrarPorCategoria(this.categoriaSeleccionada);

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  filtrarPorCategoria(categoriaId: number): void {
    this.categoriaSeleccionada = categoriaId;

    const publicacionesVisibles = this.publicaciones.filter(
      publicacion => !publicacion.baneado
    );

    this.publicacionesFiltradas = categoriaId === 0
      ? publicacionesVisibles
      : publicacionesVisibles.filter(
        publicacion => publicacion.categoria.id === categoriaId
      );
  }
}
