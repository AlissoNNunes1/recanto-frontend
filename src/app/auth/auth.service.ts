import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FingerprintService } from '../services/fingerprint.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser: boolean;
  private currentToken$ = new BehaviorSubject<string | null>(null);
  private currentRole$ = new BehaviorSubject<string | null>(null);
  private currentNome$ = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private fingerprintService: FingerprintService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Inicializa cache com valores do localStorage ao carregar
    // Crucial para manter estado apos F5 refresh
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const nome = localStorage.getItem('nome');
      
      if (token) this.currentToken$.next(token);
      if (role) this.currentRole$.next(role?.toUpperCase());
      if (nome) this.currentNome$.next(nome);
      
      console.log('AuthService inicializado com cache:', {
        hasToken: !!token,
        role: role,
        nome: nome
      });
    }
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
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
          
          // Atualiza cache em memória
          this.currentToken$.next(response.token);
          this.currentRole$.next(response.role);
          this.currentNome$.next(response.nome);
          
          console.log('Login por dispositivo bem-sucedido');
        }
      }),
      catchError((error) => {
        console.error('Erro no login por dispositivo:', error);
        if (error.status === 401) {
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
          
          // Atualiza cache em memória
          this.currentToken$.next(response.token);
          this.currentRole$.next(response.role);
          this.currentNome$.next(response.nome);
          
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
    // Usa cache em memória primeiro (mais rápido)
    const role = this.currentRole$.getValue() || 
                 (this.isBrowser ? localStorage.getItem('role') : null);
    return role?.toUpperCase() === 'ADMIN';
  }

  /**
   * Verifica se role e admin (compatibilidade)
   */
  isAdminRole(role?: string | null): boolean {
    if (!role && this.isBrowser) {
      role = localStorage.getItem('role');
    }
    return role?.toUpperCase() === 'ADMIN';
  }

  /**
   * Obtem role atual (nao null)
   */
  getRole(): string {
    return this.currentRole$.getValue() || 
           (this.isBrowser ? localStorage.getItem('role') || 'FUNCIONARIO' : 'FUNCIONARIO');
  }

  /**
   * Obtem nome atual (nao null)
   */
  getNome(): string {
    return this.currentNome$.getValue() || 
           (this.isBrowser ? localStorage.getItem('nome') || 'Usuario' : 'Usuario');
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
            
            // Atualiza cache em memória
            this.currentToken$.next(response.token);
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
    }
    
    // Limpa cache em memória
    this.currentToken$.next(null);
    this.currentRole$.next(null);
    this.currentNome$.next(null);
    
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    // Usa cache em memória primeiro (mais rápido)
    const token = this.currentToken$.getValue();
    if (token) return token;
    
    // Se não tem em cache, busca do localStorage
    if (this.isBrowser) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        this.currentToken$.next(storedToken);
        return storedToken;
      }
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Obtem token como Observable para componentes reativos
   */
  getToken$(): Observable<string | null> {
    return this.currentToken$.asObservable();
  }

  /**
   * Obtem role como Observable para componentes reativos
   */
  getRole$(): Observable<string | null> {
    return this.currentRole$.asObservable();
  }

  /**
   * Obtem nome como Observable para componentes reativos
   */
  getNome$(): Observable<string | null> {
    return this.currentNome$.asObservable();
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
// Cache em memória para melhorar performance
// Observable para reatividade em componentes
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
