import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import {
  IPAutorizado,
  IPAutorizadoCreate,
  IPAutorizadoUpdate,
  PaginatedResponse,
} from './ip-autorizado';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class IpsAutorizadosService {
  private apiUrl = '/api/v1/ips-autorizados';
  private isBrowser: boolean;
  private cache$ = new BehaviorSubject<IPAutorizado[]>([]);
  private cacheTime = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutos para dados estaticos

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHttpOptions() {
    if (!this.isBrowser) {
      return { headers: new HttpHeaders() };
    }
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
  }

  // Invalidar cache
  invalidarCache(): void {
    this.cache$.next([]);
    this.cacheTime = 0;
  }

  // Listar IPs autorizados com paginacao
  listarIPs(
    page: number = 1,
    limit: number = 50
  ): Observable<PaginatedResponse<IPAutorizado>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<IPAutorizado>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    }).pipe(
      tap((response) => {
        this.cache$.next(response.data);
        this.cacheTime = Date.now();
      }),
      shareReplay(1)
    );
  }

  // Obter IP por ID
  getIP(id: number): Observable<IPAutorizado> {
    return this.http.get<IPAutorizado>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  // Criar novo IP autorizado
  createIP(ip: IPAutorizadoCreate): Observable<IPAutorizado> {
    return this.http.post<IPAutorizado>(this.apiUrl, ip, this.getHttpOptions()).pipe(
      tap(() => this.invalidarCache())
    );
  }

  // Atualizar IP autorizado
  updateIP(id: number, ip: IPAutorizadoUpdate): Observable<IPAutorizado> {
    return this.http.put<IPAutorizado>(
      `${this.apiUrl}/${id}`,
      ip,
      this.getHttpOptions()
    ).pipe(
      tap(() => this.invalidarCache())
    );
  }

  // Deletar IP autorizado
  deleteIP(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    ).pipe(
      tap(() => this.invalidarCache())
    );
  }
}

// Servico de gestao de IPs autorizados
// Apenas administradores tem acesso a essas funcionalidades
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
