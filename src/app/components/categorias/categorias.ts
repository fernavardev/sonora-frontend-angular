import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { CATEGORIAS } from '../../data/categorias';

@Component({
  selector: 'app-categorias',
  imports: [RouterLink, Sidebar],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class Categorias {
  categorias = CATEGORIAS;
}
