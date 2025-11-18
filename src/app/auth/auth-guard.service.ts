import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    // Verifica se token existe e esta autenticado
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // Redireciona para login se nao autenticado
    this.router.navigate(['/login']);
    return false;
  }
}

// Guard de autenticacao
// Verifica se usuario esta autenticado antes de permitir acesso
// Usa isAuthenticated() do AuthService para validacao

