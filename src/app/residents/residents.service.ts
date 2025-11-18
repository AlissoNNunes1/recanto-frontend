import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import {
  Message,
  PaginatedResponse,
  Resident,
  ResidentCreate,
  ResidentUpdate,
} from './resident';

@Injectable({
  providedIn: 'root',
})
export class ResidentsService {
  private apiUrl = '/api/v1/residentes';
  private isBrowser: boolean;

  // Cache em memoria com BehaviorSubject
  private cache$ = new BehaviorSubject<Resident[]>([]);
  private cacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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
    // Usar token do AuthService (em memoria) ao invez de localStorage
    const token = this.authService.getToken();
    if (!token) {
      return { headers: new HttpHeaders() };
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
  }

  // Metodo atualizado para trabalhar com paginacao e cache
  getResidents(page: number = 1, limit: number = 50): Observable<Resident[]> {
    const agora = Date.now();

    // Se cache valido, retornar instantaneamente
    if (
      this.cache$.getValue().length &&
      agora - this.cacheTime < this.CACHE_DURATION
    ) {
      console.log('[ResidentsService] Retornando do cache de memoria');
      return this.cache$.asObservable();
    }

    console.log('[ResidentsService] Fazendo requisicao nova (cache expirado)');

    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<PaginatedResponse<Resident>>(this.apiUrl, {
        ...this.getHttpOptions(),
        params,
      })
      .pipe(
        map((response) => response.data), // Extrair apenas os dados do array
        tap((data) => {
          // Atualizar cache em memoria
          this.cache$.next(data);
          this.cacheTime = Date.now();
          console.log('[ResidentsService] Cache atualizado');
        }),
        shareReplay(1) // Compartilhar entre subscribers
      );
  }

  // Método para obter resposta completa com paginação
  getResidentsPaginated(
    page: number = 1,
    limit: number = 50
  ): Observable<PaginatedResponse<Resident>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Resident>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    });
  }

  getResident(id: number): Observable<Resident> {
    return this.http.get<Resident>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  createResident(resident: ResidentCreate): Observable<Resident> {
    return this.http
      .post<Resident>(this.apiUrl, resident, this.getHttpOptions())
      .pipe(
        tap(() => this.invalidarCache()) // Invalidar cache ao criar
      );
  }

  updateResident(id: number, resident: ResidentUpdate): Observable<Resident> {
    return this.http
      .put<Resident>(`${this.apiUrl}/${id}`, resident, this.getHttpOptions())
      .pipe(
        tap(() => this.invalidarCache()) // Invalidar cache ao atualizar
      );
  }

  deleteResident(id: number): Observable<Message> {
    return this.http
      .delete<Message>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        tap(() => this.invalidarCache()) // Invalidar cache ao deletar
      );
  }

  // Metodo para invalidar cache manualmente
  invalidarCache(): void {
    this.cache$.next([]);
    this.cacheTime = 0;
    console.log('[ResidentsService] Cache invalidado');
  }
}

// Serviço atualizado para trabalhar com paginação do backend
// Configurado para extrair dados corretos da resposta paginada
// Mantém compatibilidade com frontend existente
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
