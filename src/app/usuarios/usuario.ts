// Interfaces e tipos para Usuario

export interface Usuario {
  id: number;
  username: string;
  email: string;
  nome: string;
  cargo: 'admin' | 'funcionario';
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsuarioCreate {
  username: string;
  email: string;
  nome: string;
  senha: string;
  cargo: 'admin' | 'funcionario';
  ativo?: boolean;
}

export interface UsuarioUpdate {
  email?: string;
  nome?: string;
  senha?: string;
  cargo?: 'admin' | 'funcionario';
  ativo?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}

//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
