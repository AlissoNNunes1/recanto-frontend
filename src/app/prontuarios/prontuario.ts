// Tipos e interfaces para o módulo de Prontuários Eletrônicos

// ========== PRONTUÁRIOS ==========

export interface ProntuarioEletronico {
  id: number;
  residenteId: number;
  residente?: ResidenteBasico;
  status: StatusProntuario;
  historicoMedico?: string;
  alergias?: string;
  medicamentosContinuos?: string;
  restricoesAlimentares?: string;
  historicoFamiliar?: string;
  observacoes?: string;
  usuarioCriacaoId: number;
  usuarioAtualizacaoId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProntuarioCreate {
  residenteId: number;
  historicoMedico?: string;
  alergias?: string;
  medicamentosContinuos?: string;
  restricoesAlimentares?: string;
  historicoFamiliar?: string;
  observacoes?: string;
}

export interface ProntuarioUpdate {
  historicoMedico?: string;
  alergias?: string;
  medicamentosContinuos?: string;
  restricoesAlimentares?: string;
  historicoFamiliar?: string;
  observacoes?: string;
  status?: StatusProntuario;
}

export enum StatusProntuario {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  ARQUIVADO = 'ARQUIVADO',
}

// ========== CONSULTAS ==========

export interface Consulta {
  id: number;
  prontuarioId: number;
  profissionalId: number;
  profissional?: UsuarioBasico;
  tipoConsulta: TipoConsulta;
  dataConsulta: string;
  status: StatusConsulta;
  queixaPrincipal?: string;
  historiaDoencaAtual?: string;
  exameFisico?: string;
  hipoteseDiagnostica?: string;
  diagnostico?: string;
  tratamento?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultaCreate {
  prontuarioId: number;
  profissionalId: number;
  tipoConsulta: TipoConsulta;
  dataConsulta: string;
  queixaPrincipal?: string;
  historiaDoencaAtual?: string;
  exameFisico?: string;
  hipoteseDiagnostica?: string;
  diagnostico?: string;
  tratamento?: string;
  observacoes?: string;
}

export interface ConsultaUpdate {
  tipoConsulta?: TipoConsulta;
  dataConsulta?: string;
  queixaPrincipal?: string;
  historiaDoencaAtual?: string;
  exameFisico?: string;
  hipoteseDiagnostica?: string;
  diagnostico?: string;
  tratamento?: string;
  observacoes?: string;
}

export enum TipoConsulta {
  CONSULTA_INICIAL = 'CONSULTA_INICIAL',
  RETORNO = 'RETORNO',
  EMERGENCIA = 'EMERGENCIA',
  TELEMEDICINA = 'TELEMEDICINA',
}

export enum StatusConsulta {
  AGENDADA = 'AGENDADA',
  REALIZADA = 'REALIZADA',
  CANCELADA = 'CANCELADA',
  AUSENTE = 'AUSENTE',
}

// ========== EXAMES ==========

export interface Exame {
  id: number;
  prontuarioId: number;
  profissionalSolicitanteId: number;
  profissionalSolicitante?: UsuarioBasico;
  profissionalExecutorId?: number;
  profissionalExecutor?: UsuarioBasico;
  tipoExame: TipoExame;
  nomeExame: string;
  descricao?: string;
  status: StatusExame;
  dataSolicitacao: string;
  dataRealizacao?: string;
  resultado?: string;
  observacoes?: string;
  anexoResultado?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExameCreate {
  prontuarioId: number;
  profissionalSolicitanteId: number;
  tipoExame: TipoExame;
  nomeExame: string;
  descricao?: string;
  dataSolicitacao: string;
  observacoes?: string;
}

export enum TipoExame {
  LABORATORIAL = 'LABORATORIAL',
  IMAGEM = 'IMAGEM',
  FUNCIONAL = 'FUNCIONAL',
  ENDOSCOPIA = 'ENDOSCOPIA',
  BIOPSIA = 'BIOPSIA',
  OUTROS = 'OUTROS',
}

export enum StatusExame {
  SOLICITADO = 'SOLICITADO',
  AGENDADO = 'AGENDADO',
  REALIZADO = 'REALIZADO',
  LAUDADO = 'LAUDADO',
  CANCELADO = 'CANCELADO',
}

// ========== MEDICAÇÕES ==========

export interface MedicamentoPrescrito {
  id: number;
  prontuarioId: number;
  profissionalId: number;
  profissional?: UsuarioBasico;
  medicamentoNome: string;
  dosagem: string;
  viaAdministracao: string;
  frequenciaAdministracao: string;
  indicacaoClinica: string;
  instrucoesUso?: string;
  status: StatusPrescricao;
  dataPrescricao: string;
  dataInicio: string;
  dataFim?: string;
  quantidade?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicamentoCreate {
  prontuarioId: number;
  profissionalId: number;
  medicamentoNome: string;
  dosagem: string;
  viaAdministracao: string;
  frequenciaAdministracao: string;
  indicacaoClinica: string;
  instrucoesUso?: string;
  dataInicio: string;
  dataFim?: string;
  quantidade?: string;
  observacoes?: string;
}

export enum StatusPrescricao {
  ATIVA = 'ATIVA',
  SUSPENSA = 'SUSPENSA',
  FINALIZADA = 'FINALIZADA',
}

// ========== TIPOS AUXILIARES ==========

export interface ResidenteBasico {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
}

export interface UsuarioBasico {
  id: number;
  nome: string;
  username: string;
}

export interface Message {
  message: string;
}

// ========== DTOs PARA FILTROS E PAGINAÇÃO ==========

export interface ProntuariosFiltro {
  page?: number;
  limit?: number;
  status?: StatusProntuario;
  residenteNome?: string;
}

export interface ConsultasFiltro {
  status?: StatusConsulta;
}

export interface ExamesFiltro {
  status?: StatusExame;
  tipoExame?: TipoExame;
}

export interface MedicamentosFiltro {
  status?: StatusPrescricao;
}

export interface PaginacaoResponse<T> {
  data: T[];
  pageInfo: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
