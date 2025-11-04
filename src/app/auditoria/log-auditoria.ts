// Interfaces e tipos para Log de Auditoria

export interface LogAuditoria {
  id: number;
  usuarioId?: number;
  username?: string;
  acao: string;
  recurso?: string;
  recursoId?: number;
  detalhes?: any;
  timestamp: Date;
  usuario?: {
    id: number;
    username: string;
    nome: string;
    cargo: string;
  };
}

export interface FiltrosAuditoria {
  usuarioId?: number;
  acao?: string;
  recurso?: string;
  recursoId?: number;
  dataInicio?: string;
  dataFim?: string;
  ip?: string;
  page?: number;
  limit?: number;
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

export interface AuditoriaStats {
  totalLogs: number;
  logsPorAcao: { [key: string]: number };
  logsPorUsuario: { [key: string]: number };
  ultimosAcessos: Date[];
}

//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
