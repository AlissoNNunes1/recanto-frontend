// Interfaces para Dashboard Administrativo

export interface DashboardStats {
  totalResidentes: number;
  totalFuncionarios: number;
  totalUsuarios: number;
  totalIPsAutorizados: number;
  residentes: {
    ativos: number;
    inativos: number;
    recentes: number; // ultimos 30 dias
  };
  funcionarios: {
    ativos: number;
    inativos: number;
    recentes: number;
  };
  auditoria: {
    totalLogs: number;
    logsPorAcao: { [key: string]: number };
    ultimasAtividades: AtividadeRecente[];
  };
}

export interface AtividadeRecente {
  id: number;
  usuario: string;
  acao: string;
  recurso: string;
  timestamp: Date;
  ip: string;
}

export interface CardStats {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
