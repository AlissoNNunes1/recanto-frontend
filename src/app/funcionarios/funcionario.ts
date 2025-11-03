// src/app/funcionarios/funcionario.ts

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  funcao: string;
  turno: string;
  telefone: string;
  email: string;
  usuarioId?: number; // Corrigido: opcional e camelCase
  createdAt: Date;
  updatedAt: Date;
  usuario?: Usuario; // Relacionamento opcional
}

export interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  cargo: string;
  ativo: boolean;
  senha?: string; // Para exibição das credenciais
}

export interface FuncionarioCreate {
  nome: string;
  cpf: string;
  funcao: string;
  turno: string;
  telefone: string;
  email: string;
  usuarioId?: number; // Corrigido: opcional
}

export interface FuncionarioUpdate {
  nome?: string;
  cpf?: string;
  funcao?: string;
  turno?: string;
  telefone?: string;
  email?: string;
}

export interface CreateUsuarioForFuncionarioDto {
  nome: string;
  username: string;
  email: string;
  senha: string;
  cargo: string;
}

// Interfaces para paginação (correspondentes ao backend)
export interface PageInfoDto {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pageInfo: PageInfoDto;
}

export interface FuncionarioFilterDto {
  page: number;
  limit: number;
  nome?: string;
  cpf?: string;
  funcao?: string;
  turno?: string;
  ordenarPor?: string;
  ordenacao?: 'ASC' | 'DESC';
}

export interface Message {
  message: string;
}
