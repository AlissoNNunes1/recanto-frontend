import { Component, Inject, OnInit } from '@angular/core';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { NgOptimizedImage, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MdbCollapseModule, NgOptimizedImage, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  imageUrl: string;
  role: string = '';
  nome: string = '';
  sidebarOpen: boolean = false;

  constructor(@Inject(IMAGE_LOADER) private imageLoader: (config: ImageLoaderConfig) => string) {
    this.imageUrl = this.imageLoader({ src: 'https://github.com/AlissoNNunes1/recanto-frontend/blob/main/src/assets/6.png?raw=true' });
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
}
