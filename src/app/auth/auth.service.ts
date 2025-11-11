// src/app/auth/auth.service.ts

import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FingerprintService } from '../services/fingerprint.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fingerprintService: FingerprintService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Obtem IP publico (mantido para compatibilidade)
   * Agora usa fingerprint como identificador principal
   */
  getPublicIp(): Observable<string> {
    return from(
      fetch('https://api.ipify.org?format=json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => data.ip)
    );
  }

  /**
   * Login automatico por dispositivo (fingerprint)
   * Usa fingerprint unico do navegador como identificador
   * Suporta IPs dinamicos - apenas o dispositivo e validado
   */
  loginByDevice(): Observable<any> {
    const fingerprint = this.fingerprintService.getFingerprint();
    console.log('Tentando login com fingerprint:', fingerprint);

    const body = { identificadorDispositivo: fingerprint };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>('/api/v1/auth/login', body, { headers }).pipe(
      tap((response) => {
        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('nome', response.nome);
          localStorage.setItem('usuarioId', response.usuarioId.toString());
          if (response.newToken) {
            localStorage.setItem('newToken', response.newToken);
          }
          console.log('Login por dispositivo bem-sucedido');
        }
      }),
      catchError((error) => {
        console.error('Erro no login por dispositivo:', error);
        if (error.status === 401) {
          // Dispositivo nao autorizado - redirecionar para login por credenciais
          console.log('Dispositivo nao autorizado, redirecionando para login');
          return throwError('Dispositivo nao autorizado');
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Login por credenciais (username/senha)
   */
  loginByCredentials(username: string, senha: string): Observable<any> {
    const body = { username, senha };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>('/api/v1/auth/login', body, { headers }).pipe(
      tap((response) => {
        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('nome', response.nome);
          localStorage.setItem('usuarioId', response.usuarioId.toString());
          if (response.newToken) {
            localStorage.setItem('newToken', response.newToken);
          }
          console.log('Login por credenciais bem-sucedido');
        }
      }),
      catchError((error) => {
        console.error('Erro no login por credenciais:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Login - metodo unificado (mantido para compatibilidade)
   * Usa fingerprint se ip for passado, senao credenciais
   */
  login(ip?: string, username?: string, senha?: string): Observable<any> {
    if (ip) {
      // Se IP foi passado, usar login por dispositivo (fingerprint)
      return this.loginByDevice();
    } else if (username && senha) {
      // Login por credenciais
      return this.loginByCredentials(username, senha);
    } else {
      return throwError('username e senha sao necessarios para login');
    }
  }

  get isAdmin(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem('role') === 'ADMIN';
  }

  refreshToken(): Observable<any> {
    if (!this.isBrowser) {
      return throwError('localStorage not available in SSR');
    }
    const refreshToken = localStorage.getItem('newToken');
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('token', refreshToken);

    return this.http
      .post<any>('/api/v1/auth/refresh-token', body.toString(), {
        headers,
      })
      .pipe(
        tap((response) => {
          if (this.isBrowser) {
            localStorage.setItem('token', response.token);
            if (response.newToken) {
              localStorage.setItem('newToken', response.newToken);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('newToken');
      localStorage.removeItem('role');
      localStorage.removeItem('nome');
      localStorage.removeItem('usuarioId');
      // NAO limpar fingerprint no logout - manter para proximo login
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Obtem informacoes de debug do dispositivo
   */
  getDeviceDebugInfo(): any {
    return this.fingerprintService.getDebugInfo();
  }

  /**
   * Regenera fingerprint do dispositivo
   * Usar apenas em casos especificos
   */
  regenerateDeviceFingerprint(): string {
    return this.fingerprintService.regenerateFingerprint();
  }
}

// Servico de autenticacao com suporte a fingerprint de dispositivo
// Permite login automatico independente do IP (suporta IPs dinamicos)
// Mantem compatibilidade com login por credenciais
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
