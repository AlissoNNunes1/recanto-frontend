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

  constructor(@Inject(IMAGE_LOADER) private imageLoader: (config: ImageLoaderConfig) => string) {
    // Substitua '6.png' pelo caminho correto da imagem conforme necessário
    this.imageUrl = this.imageLoader({ src: '6.png' });
  }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.role = localStorage.getItem('role') || 'funcionário';
      this.nome = localStorage.getItem('nome') || 'Usuário';
    } else {
      this.role = 'funcionário';
    }
  }
}


