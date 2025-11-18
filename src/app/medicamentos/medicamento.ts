export enum FormaFarmaceutica {
  COMPRIMIDO = 'COMPRIMIDO',
  CAPSULA = 'CAPSULA',
  SOLUCAO = 'SOLUCAO',
  SUSPENSAO = 'SUSPENSAO',
  INJETAVEL = 'INJETAVEL',
  POMADA = 'POMADA',
  CREME = 'CREME',
  COLIRIO = 'COLIRIO',
  SPRAY = 'SPRAY',
  XAROPE = 'XAROPE',
  GOTAS = 'GOTAS',
  ADESIVO = 'ADESIVO',
  OUTROS = 'OUTROS',
}

export interface Medicamento {
  id: number;
  nome: string;
  principioAtivo: string;
  laboratorio: string;
  concentracao: string;
  formaFarmaceutica: FormaFarmaceutica;
  codigoBarras?: string;
  registroAnvisa?: string;
  controlado: boolean;
  refrigerado: boolean;
  fotosensivel: boolean;
  observacoes?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicamentoCreate {
  nome: string;
  principioAtivo: string;
  laboratorio: string;
  concentracao: string;
  formaFarmaceutica: FormaFarmaceutica;
  codigoBarras?: string;
  registroAnvisa?: string;
  controlado?: boolean;
  refrigerado?: boolean;
  fotosensivel?: boolean;
  observacoes?: string;
}

export interface MedicamentoUpdate {
  nome?: string;
  principioAtivo?: string;
  laboratorio?: string;
  concentracao?: string;
  formaFarmaceutica?: FormaFarmaceutica;
  codigoBarras?: string;
  registroAnvisa?: string;
  controlado?: boolean;
  refrigerado?: boolean;
  fotosensivel?: boolean;
  observacoes?: string;
  ativo?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/*
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
