import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria';

@Component({
  selector: 'app-categorias',
  imports: [RouterLink, Sidebar],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias implements OnInit {

  private categoriaService = inject(CategoriaService);
  private cdr = inject(ChangeDetectorRef);

  categorias: Categoria[] = [];

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('No fue posible cargar las categorías.', err);
      }
    });
  }
}
