import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import {
  Consulta,
  ConsultaCreate,
  ConsultasFiltro,
  ConsultaUpdate,
  Exame,
  ExameCreate,
  ExamesFiltro,
  MedicamentoCreate,
  MedicamentoPrescrito,
  MedicamentosFiltro,
  PaginacaoResponse,
  ProntuarioCreate,
  ProntuarioEletronico,
  ProntuariosFiltro,
  ProntuarioUpdate,
} from './prontuario';

@Injectable({
  providedIn: 'root',
})
export class ProntuariosService {
  private apiUrl = '/api/v1/prontuarios';
  private isBrowser: boolean;
  private cache$ = new BehaviorSubject<ProntuarioEletronico[]>([]);
  private cacheTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos para dados medicos

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

  // ========== PRONTUÁRIOS ==========

  getProntuarios(
    filtros?: ProntuariosFiltro
  ): Observable<PaginacaoResponse<ProntuarioEletronico>> {
    let params = new HttpParams();

    if (filtros?.page) params = params.set('page', filtros.page.toString());
    if (filtros?.limit) params = params.set('limit', filtros.limit.toString());
    if (filtros?.status) params = params.set('status', filtros.status);
    if (filtros?.residenteNome)
      params = params.set('residenteNome', filtros.residenteNome);

    return this.http
      .get<PaginacaoResponse<ProntuarioEletronico>>(this.apiUrl, {
        ...this.getHttpOptions(),
        params,
      })
      .pipe(
        tap((response) => {
          this.cache$.next(response.data);
          this.cacheTime = Date.now();
        }),
        shareReplay(1)
      );
  }

  getProntuario(id: number): Observable<ProntuarioEletronico> {
    return this.http.get<ProntuarioEletronico>(
      `${this.apiUrl}/${id}`,
      this.getHttpOptions()
    );
  }

  getProntuarioPorResidente(
    residenteId: number
  ): Observable<ProntuarioEletronico> {
    return this.http.get<ProntuarioEletronico>(
      `${this.apiUrl}/residente/${residenteId}`,
      this.getHttpOptions()
    );
  }

  createProntuario(
    prontuario: ProntuarioCreate
  ): Observable<ProntuarioEletronico> {
    return this.http
      .post<ProntuarioEletronico>(
        this.apiUrl,
        prontuario,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  updateProntuario(
    id: number,
    prontuario: ProntuarioUpdate
  ): Observable<ProntuarioEletronico> {
    return this.http
      .put<ProntuarioEletronico>(
        `${this.apiUrl}/${id}`,
        prontuario,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  // ========== CONSULTAS ==========

  getConsultas(
    prontuarioId: number,
    filtros?: ConsultasFiltro
  ): Observable<Consulta[]> {
    let params = new HttpParams();

    if (filtros?.status) params = params.set('status', filtros.status);

    return this.http.get<Consulta[]>(
      `${this.apiUrl}/${prontuarioId}/consultas`,
      {
        ...this.getHttpOptions(),
        params,
      }
    );
  }

  getConsulta(consultaId: number): Observable<Consulta> {
    return this.http.get<Consulta>(
      `${this.apiUrl}/consultas/${consultaId}`,
      this.getHttpOptions()
    );
  }

  createConsulta(
    prontuarioId: number,
    consulta: ConsultaCreate
  ): Observable<Consulta> {
    return this.http
      .post<Consulta>(
        `${this.apiUrl}/${prontuarioId}/consultas`,
        consulta,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  updateConsulta(
    consultaId: number,
    consulta: ConsultaUpdate
  ): Observable<Consulta> {
    return this.http
      .put<Consulta>(
        `${this.apiUrl}/consultas/${consultaId}`,
        consulta,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  realizarConsulta(
    consultaId: number,
    dadosAtualizacao: ConsultaUpdate
  ): Observable<Consulta> {
    return this.http
      .put<Consulta>(
        `${this.apiUrl}/consultas/${consultaId}/realizar`,
        dadosAtualizacao,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  // ========== EXAMES ==========

  getExames(prontuarioId: number, filtros?: ExamesFiltro): Observable<Exame[]> {
    let params = new HttpParams();

    if (filtros?.status) params = params.set('status', filtros.status);
    if (filtros?.tipoExame) params = params.set('tipoExame', filtros.tipoExame);

    return this.http.get<Exame[]>(`${this.apiUrl}/${prontuarioId}/exames`, {
      ...this.getHttpOptions(),
      params,
    });
  }

  getExame(exameId: number): Observable<Exame> {
    return this.http.get<Exame>(
      `${this.apiUrl}/exames/${exameId}`,
      this.getHttpOptions()
    );
  }

  createExame(prontuarioId: number, exame: ExameCreate): Observable<Exame> {
    return this.http
      .post<Exame>(
        `${this.apiUrl}/${prontuarioId}/exames`,
        exame,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  updateExame(exameId: number, exame: Partial<ExameCreate>): Observable<Exame> {
    return this.http
      .put<Exame>(
        `${this.apiUrl}/exames/${exameId}`,
        exame,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  // ========== MEDICAMENTOS ==========

  getMedicamentos(
    prontuarioId: number,
    filtros?: MedicamentosFiltro
  ): Observable<MedicamentoPrescrito[]> {
    let params = new HttpParams();

    if (filtros?.status) params = params.set('status', filtros.status);

    return this.http.get<MedicamentoPrescrito[]>(
      `${this.apiUrl}/${prontuarioId}/medicamentos`,
      {
        ...this.getHttpOptions(),
        params,
      }
    );
  }

  getMedicamento(medicamentoId: number): Observable<MedicamentoPrescrito> {
    return this.http.get<MedicamentoPrescrito>(
      `${this.apiUrl}/medicamentos/${medicamentoId}`,
      this.getHttpOptions()
    );
  }

  createMedicamento(
    prontuarioId: number,
    medicamento: MedicamentoCreate
  ): Observable<MedicamentoPrescrito> {
    return this.http
      .post<MedicamentoPrescrito>(
        `${this.apiUrl}/${prontuarioId}/medicamentos`,
        medicamento,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  updateMedicamento(
    medicamentoId: number,
    medicamento: Partial<MedicamentoCreate>
  ): Observable<MedicamentoPrescrito> {
    return this.http
      .put<MedicamentoPrescrito>(
        `${this.apiUrl}/medicamentos/${medicamentoId}`,
        medicamento,
        this.getHttpOptions()
      )
      .pipe(tap(() => this.invalidarCache()));
  }

  suspenderMedicamento(
    medicamentoId: number
  ): Observable<MedicamentoPrescrito> {
    return this.http.put<MedicamentoPrescrito>(
      `${this.apiUrl}/medicamentos/${medicamentoId}/suspender`,
      {},
      this.getHttpOptions()
    );
  }

  excluirMedicamento(medicamentoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/medicamentos/${medicamentoId}`,
      this.getHttpOptions()
    );
  }
}

/*
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
