import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  standalone: true
})
export class SidebarComponent implements OnInit {
  isSidebarCollapsed = false;
  isMobile = false;
  role: string = '';
  nome: string = '';
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadUserInfo();
      this.checkMobile();
      window.addEventListener('resize', () => this.checkMobile());
    }
  }

  loadUserInfo(): void {
    if (this.isBrowser) {
      this.role = localStorage.getItem('role') || '';
      this.nome = localStorage.getItem('nome') || 'Usuario';
    }
  }

  checkMobile(): void {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 768;
      if (this.isMobile) {
        this.isSidebarCollapsed = true;
      }
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebarOnMobile(): void {
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.clear();
      this.router.navigate(['/']);
    }
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}

// Componente de sidebar lateral reutilizavel
// Mobile-first com colapso automatico
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
