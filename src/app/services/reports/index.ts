// Exportar todos os servicos de relatorios
export * from './auditoria-report.service';
export * from './funcionario-report.service';
export * from './pdf-builder.service';
export * from './prontuario-report.service';
export * from './report.service';
export * from './residente-report.service';

// Sistema de relatorios modular
// Fornece servicos especializados para cada tipo de relatorio
// Uso: import { ProntuarioReportService } from '@services/reports';
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
