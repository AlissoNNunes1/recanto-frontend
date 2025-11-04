// Interfaces e tipos para IP Autorizado

export interface IPAutorizado {
  id: number;
  ip: string;
  descricao: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPAutorizadoCreate {
  ip: string;
  descricao: string;
  ativo?: boolean;
}

export interface IPAutorizadoUpdate {
  descricao?: string;
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
