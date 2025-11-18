import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface para SinalVital
export interface SinalVital {
  id: number;
  residenteId: number;
  residente?: {
    id: number;
    nome: string;
  };
  usuarioId: number;
  usuario?: {
    id: number;
    nome: string;
    cargo: string;
  };
  pressaoSistolica?: number | string;
  pressaoDiastolica?: number | string;
  temperatura?: number | string;
  frequenciaCardiaca?: number | string;
  saturacaoOxigenio?: number | string;
  frequenciaRespiratoria?: number | string;
  peso?: number | string;
  altura?: number | string;
  glicemia?: number | string;
  observacoes?: string;
  dataMedicao: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para criacao de SinalVital
export interface CreateSinalVitalDto {
  residenteId: number;
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  temperatura?: number;
  frequenciaCardiaca?: number;
  saturacaoOxigenio?: number;
  frequenciaRespiratoria?: number;
  peso?: number;
  altura?: number;
  glicemia?: number;
  observacoes?: string;
  dataMedicao: Date;
}

// Interface para atualizacao de SinalVital
export interface UpdateSinalVitalDto {
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  temperatura?: number;
  frequenciaCardiaca?: number;
  saturacaoOxigenio?: number;
  frequenciaRespiratoria?: number;
  peso?: number;
  altura?: number;
  glicemia?: number;
  observacoes?: string;
  dataMedicao?: Date;
}

// Interface para filtros de busca
export interface SinaisVitaisFiltros {
  residenteId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  page?: number;
  limit?: number;
}

// Interface para resposta paginada
export interface SinaisVitaisPaginado {
  data: SinalVital[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface para estatisticas
export interface SinaisVitaisEstatisticas {
  residenteId: number;
  periodo: {
    inicio: Date;
    fim: Date;
    dias: number;
  };
  medias: {
    pressaoSistolica?: number;
    pressaoDiastolica?: number;
    temperatura?: number;
    frequenciaCardiaca?: number;
    saturacaoOxigenio?: number;
    frequenciaRespiratoria?: number;
    peso?: number;
    altura?: number;
    glicemia?: number;
  };
  historico: SinalVital[];
}

@Injectable({
  providedIn: 'root',
})
export class SinaisVitaisService {
  private readonly apiUrl = '/api/v1/sinais-vitais';

  constructor(private http: HttpClient) {}

  // Criar novo registro de sinais vitais
  criar(dto: CreateSinalVitalDto): Observable<SinalVital> {
    return this.http.post<SinalVital>(this.apiUrl, dto);
  }

  // Buscar sinais vitais por ID
  buscarPorId(id: number): Observable<SinalVital> {
    return this.http.get<SinalVital>(`${this.apiUrl}/${id}`);
  }

  // Listar sinais vitais com filtros
  listar(filtros: SinaisVitaisFiltros = {}): Observable<SinaisVitaisPaginado> {
    let params = new HttpParams();

    if (filtros.residenteId) {
      params = params.set('residenteId', filtros.residenteId.toString());
    }
    if (filtros.dataInicio) {
      params = params.set('dataInicio', filtros.dataInicio.toISOString());
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', filtros.dataFim.toISOString());
    }
    if (filtros.page) {
      params = params.set('page', filtros.page.toString());
    }
    if (filtros.limit) {
      params = params.set('limit', filtros.limit.toString());
    }

    return this.http.get<SinaisVitaisPaginado>(this.apiUrl, { params });
  }

  // Buscar ultimos registros de um residente
  buscarUltimos(
    residenteId: number,
    quantidade: number = 10
  ): Observable<SinalVital[]> {
    return this.http.get<SinalVital[]>(
      `${this.apiUrl}/residente/${residenteId}/ultimos`,
      {
        params: { quantidade: quantidade.toString() },
      }
    );
  }

  // Calcular estatisticas de um residente
  calcularEstatisticas(
    residenteId: number,
    dias: number = 30
  ): Observable<SinaisVitaisEstatisticas> {
    return this.http.get<SinaisVitaisEstatisticas>(
      `${this.apiUrl}/residente/${residenteId}/estatisticas`,
      {
        params: { dias: dias.toString() },
      }
    );
  }

  // Atualizar sinais vitais
  atualizar(id: number, dto: UpdateSinalVitalDto): Observable<SinalVital> {
    return this.http.put<SinalVital>(`${this.apiUrl}/${id}`, dto);
  }

  // Excluir sinais vitais
  excluir(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

// Servico de sinais vitais
// Gerencia comunicacao HTTP com API de sinais vitais
// Inclui metodos para CRUD, estatisticas e historico
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
