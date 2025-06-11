import {
  CommonModule,
  IMAGE_LOADER,
  ImageLoaderConfig,
  NgOptimizedImage,
} from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { CollapseComponent } from '../shared/collapse/collapse.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CollapseComponent, NgOptimizedImage, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  imageUrl: string;
  role: string = '';
  nome: string = '';
  sidebarOpen: boolean = false;

  constructor(
    @Inject(IMAGE_LOADER)
    private imageLoader: (config: ImageLoaderConfig) => string
  ) {
    this.imageUrl = this.imageLoader({
      src: 'https://github.com/AlissoNNunes1/recanto-frontend/blob/main/src/assets/6.png?raw=true',
    });
  }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.role = localStorage.getItem('role') || 'funcionário';
      this.nome = localStorage.getItem('nome') || 'Usuário';
    } else {
      this.role = 'funcionário';
    }
  }
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  /**
   * Método para alternar o estado da navbar mobile
   * Implementa acessibilidade e responsividade
   */
  toggleNavbar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
