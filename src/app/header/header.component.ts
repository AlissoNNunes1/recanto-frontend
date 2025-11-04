import { CommonModule, IMAGE_LOADER, ImageLoaderConfig, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CollapseComponent } from '../shared/collapse/collapse.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CollapseComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  imageUrl: string;
  role: string = '';
  nome: string = '';
  sidebarOpen: boolean = false;
  private isBrowser: boolean;

  constructor(
    @Inject(IMAGE_LOADER)
    private imageLoader: (config: ImageLoaderConfig) => string,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.imageUrl = this.imageLoader({
      src: 'https://github.com/AlissoNNunes1/recanto-frontend/blob/main/src/assets/6.png?raw=true',
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
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
