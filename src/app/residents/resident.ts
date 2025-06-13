/**
 * Interface para representar um residente no sistema
 * Corresponde à estrutura do backend com campos atualizados
 */
export interface Resident {
  id: number;
  nome: string;
  sexo: 'M' | 'F';
  email: string;
  cpf: string;
  rg?: string;
  contatoEmergencia: string;
  historicoMedico?: string;
  foto?: string;
  dataNascimento: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para criar um novo residente
 * Campos obrigatórios para criação
 */
export interface ResidentCreate {
  nome: string;
  sexo: 'M' | 'F';
  email: string;
  cpf: string;
  rg?: string;
  contatoEmergencia: string;
  historicoMedico?: string;
  foto?: string;
  dataNascimento: string;
}

/**
 * Interface para atualizar um residente existente
 * Todos os campos são opcionais para atualização parcial
 */
export interface ResidentUpdate {
  nome?: string;
  sexo?: 'M' | 'F';
  email?: string;
  cpf?: string;
  rg?: string;
  contatoEmergencia?: string;
  historicoMedico?: string;
  foto?: string;
  dataNascimento?: string;
}

/**
 * Interface para resposta de mensagem do backend
 */
export interface Message {
  message: string;
}

/**
 * Interface para informações de paginação - ATUALIZADA
 */
export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface para resposta paginada do backend - ATUALIZADA
 */
export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: PageInfo;
}

/**
 * Interface para filtros de pesquisa
 */
export interface ResidentFilters {
  page?: number;
  limit?: number;
  nome?: string;
  cpf?: string;
  ordenarPor?: 'nome' | 'email' | 'cpf' | 'dataNascimento' | 'createdAt';
  ordenacao?: 'ASC' | 'DESC';
}

// Interfaces atualizadas para corresponder ao backend do Sistema Recanto
// Incluindo campos opcionais e estrutura de paginação para melhor UX
// Configurado para TypeScript strict mode e validações do frontend
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
