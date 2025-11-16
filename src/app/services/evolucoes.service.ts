import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface para Evolucao
export interface Evolucao {
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
  dataRegistro: Date;
  descricaoEvolucao: string;
  objectivos?: string;
  intervencoes?: string;
  resultados?: string;
  dataSeguimento?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para criacao de Evolucao
export interface CreateEvolucaoDto {
  residenteId: number;
  descricaoEvolucao: string;
  objectivos?: string;
  intervencoes?: string;
  resultados?: string;
  dataSeguimento?: Date;
}

// Interface para atualizacao de Evolucao
export interface UpdateEvolucaoDto {
  descricaoEvolucao?: string;
  objectivos?: string;
  intervencoes?: string;
  resultados?: string;
  dataSeguimento?: Date;
}

// Interface para filtros de busca
export interface EvolucoesFiltros {
  residenteId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  page?: number;
  limit?: number;
}

// Interface para resposta paginada
export interface EvolucoesPaginado {
  data: Evolucao[];
  pageInfo: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EvolucoesService {
  private readonly apiUrl = '/api/v1/evolucoes';

  constructor(private http: HttpClient) {}

  // Criar nova evolucao
  criar(dto: CreateEvolucaoDto): Observable<Evolucao> {
    return this.http.post<Evolucao>(this.apiUrl, dto);
  }

  // Buscar evolucao por ID
  buscarPorId(id: number): Observable<Evolucao> {
    return this.http.get<Evolucao>(`${this.apiUrl}/${id}`);
  }

  // Listar evolucoes com filtros
  listar(filtros: EvolucoesFiltros = {}): Observable<EvolucoesPaginado> {
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

    return this.http.get<EvolucoesPaginado>(this.apiUrl, { params });
  }

  // Buscar ultimas evolucoes de um residente
  buscarUltimas(
    residenteId: number,
    quantidade: number = 5
  ): Observable<Evolucao[]> {
    return this.http.get<Evolucao[]>(
      `${this.apiUrl}/residente/${residenteId}/ultimas`,
      {
        params: { quantidade: quantidade.toString() },
      }
    );
  }

  // Atualizar evolucao
  atualizar(id: number, dto: UpdateEvolucaoDto): Observable<Evolucao> {
    return this.http.put<Evolucao>(`${this.apiUrl}/${id}`, dto);
  }

  // Excluir evolucao
  excluir(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

// Servico de evolucoes
// Gerencia comunicacao HTTP com API de evolucoes clinicas
// Inclui metodos para CRUD e filtros
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
