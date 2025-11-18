import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import {
  Medicamento,
  MedicamentoCreate,
  MedicamentoUpdate,
  PaginatedResponse,
} from './medicamento';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MedicamentosService {
  private apiUrl = '/api/v1/medicamentos';
  private isBrowser: boolean;
  private cache$ = new BehaviorSubject<Medicamento[]>([]);
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

  // Listar medicamentos com paginacao
  listarMedicamentos(
    page: number = 1,
    limit: number = 50,
    filtros?: any
  ): Observable<PaginatedResponse<Medicamento>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filtros) {
      if (filtros.nome) {
        params = params.set('nome', filtros.nome);
      }
      if (filtros.principioAtivo) {
        params = params.set('principioAtivo', filtros.principioAtivo);
      }
      if (filtros.laboratorio) {
        params = params.set('laboratorio', filtros.laboratorio);
      }
      if (filtros.formaFarmaceutica) {
        params = params.set('formaFarmaceutica', filtros.formaFarmaceutica);
      }
      if (filtros.controlado !== undefined) {
        params = params.set('controlado', filtros.controlado.toString());
      }
      if (filtros.ativo !== undefined) {
        params = params.set('ativo', filtros.ativo.toString());
      }
    }

    return this.http.get<PaginatedResponse<Medicamento>>(this.apiUrl, {
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

  // Obter medicamento por ID
  getMedicamento(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  // Criar novo medicamento
  createMedicamento(medicamento: MedicamentoCreate): Observable<Medicamento> {
    return this.http.post<Medicamento>(this.apiUrl, medicamento, this.getHttpOptions()).pipe(
      tap(() => this.invalidarCache())
    );
  }

  // Atualizar medicamento
  updateMedicamento(id: number, medicamento: MedicamentoUpdate): Observable<Medicamento> {
    return this.http.put<Medicamento>(
      `${this.apiUrl}/${id}`,
      medicamento,
      this.getHttpOptions()
    ).pipe(
      tap(() => this.invalidarCache())
    );
  }

  // Desativar medicamento
  deactivateMedicamento(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/deactivate`,
      {},
      this.getHttpOptions()
    ).pipe(
      tap(() => this.invalidarCache())
    );
  }

  // Reativar medicamento
  reactivateMedicamento(id: number): Observable<Medicamento> {
    return this.http.patch<Medicamento>(
      `${this.apiUrl}/${id}/reactivate`,
      {},
      this.getHttpOptions()
    ).pipe(
      tap(() => this.invalidarCache())
    );
  }

  // Deletar medicamento
  deleteMedicamento(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    ).pipe(
      tap(() => this.invalidarCache())
    );
  }
}

// Servico de gestao de medicamentos
// Cache 10 minutos para dados estaticos
// Apenas administradores tem acesso a essas funcionalidades
/*
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
