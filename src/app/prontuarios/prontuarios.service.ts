import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
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
  private apiUrl = 'http://192.168.0.169:3000/api/prontuarios';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHttpOptions() {
    if (!this.isBrowser) {
      return { headers: new HttpHeaders() };
    }
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return { headers };
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

    return this.http.get<PaginacaoResponse<ProntuarioEletronico>>(this.apiUrl, {
      ...this.getHttpOptions(),
      params,
    });
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
    return this.http.post<ProntuarioEletronico>(
      this.apiUrl,
      prontuario,
      this.getHttpOptions()
    );
  }

  updateProntuario(
    id: number,
    prontuario: ProntuarioUpdate
  ): Observable<ProntuarioEletronico> {
    return this.http.put<ProntuarioEletronico>(
      `${this.apiUrl}/${id}`,
      prontuario,
      this.getHttpOptions()
    );
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
    return this.http.post<Consulta>(
      `${this.apiUrl}/${prontuarioId}/consultas`,
      consulta,
      this.getHttpOptions()
    );
  }

  updateConsulta(
    consultaId: number,
    consulta: ConsultaUpdate
  ): Observable<Consulta> {
    return this.http.put<Consulta>(
      `${this.apiUrl}/consultas/${consultaId}`,
      consulta,
      this.getHttpOptions()
    );
  }

  realizarConsulta(
    consultaId: number,
    dadosAtualizacao: ConsultaUpdate
  ): Observable<Consulta> {
    return this.http.put<Consulta>(
      `${this.apiUrl}/consultas/${consultaId}/realizar`,
      dadosAtualizacao,
      this.getHttpOptions()
    );
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
    return this.http.post<Exame>(
      `${this.apiUrl}/${prontuarioId}/exames`,
      exame,
      this.getHttpOptions()
    );
  }

  updateExame(exameId: number, exame: Partial<ExameCreate>): Observable<Exame> {
    return this.http.put<Exame>(
      `${this.apiUrl}/exames/${exameId}`,
      exame,
      this.getHttpOptions()
    );
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
    return this.http.post<MedicamentoPrescrito>(
      `${this.apiUrl}/${prontuarioId}/medicamentos`,
      medicamento,
      this.getHttpOptions()
    );
  }

  updateMedicamento(
    medicamentoId: number,
    medicamento: Partial<MedicamentoCreate>
  ): Observable<MedicamentoPrescrito> {
    return this.http.put<MedicamentoPrescrito>(
      `${this.apiUrl}/medicamentos/${medicamentoId}`,
      medicamento,
      this.getHttpOptions()
    );
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
}
