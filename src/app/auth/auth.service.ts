// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  // Método existente para tratar erros
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }

  // Adicionado método login com parâmetros email e senha
  login(email: string, senha: string): Observable<any> {
  const body = { email, senha}

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>('http://localhost:3000/api/login', body, { headers })
      .pipe(
        tap(response => {
          // Armazena o token recebido no localStorage
          localStorage.setItem('token', response.token);
          if (response.newToken) {
            localStorage.setItem('newToken', response.newToken);
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('newToken');
    const body = new URLSearchParams();
    if (refreshToken) {
      body.set('newToken', refreshToken);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>('http://localhost:3000/api/refresh-token', body.toString(), { headers })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          if (response.newToken) {
            localStorage.setItem('newToken', response.newToken);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    // Limpar o armazenamento local
    localStorage.removeItem('token');
    localStorage.removeItem('newToken');
    // Redirecionar para a página de login
    this.router.navigate(['/login']);
  }

  // Método para obter o token de acesso
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
