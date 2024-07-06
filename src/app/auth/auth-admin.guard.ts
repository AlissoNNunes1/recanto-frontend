// src/app/auth/admin-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service'; // Ajuste o caminho conforme necessário

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin) {
      return true;
    } else {
      this.router.navigate(['/login']); // Redireciona para a página de login ou outra página apropriada
      return false;
    }
  }
}
