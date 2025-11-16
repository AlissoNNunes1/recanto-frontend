import { Injectable } from '@angular/core';
import { PdfBuilderService } from './pdf-builder.service';
import { ReportService } from './report.service';

// Interface para dados de auditoria
interface AuditoriaData {
  id: number;
  usuarioId: number;
  usuarioNome?: string;
  acao: string;
  recurso: string;
  recursoId?: number;
  ipAddress?: string;
  createdAt: Date;
  detalhes?: any;
}

/**
 * Servico especializado para relatorios de auditoria
 */
@Injectable({
  providedIn: 'root',
})
export class AuditoriaReportService extends ReportService {
  constructor(protected override pdfBuilder: PdfBuilderService) {
    super(pdfBuilder);
  }

  /**
   * Gera relatorio de logs de auditoria
   */
  generateAuditoriaReport(
    logs: AuditoriaData[],
    filtros?: {
      dataInicio?: Date;
      dataFim?: Date;
      usuario?: string;
      acao?: string;
    }
  ): void {
    let subtitle = `Total: ${logs.length} registros`;

    if (filtros) {
      if (filtros.dataInicio && filtros.dataFim) {
        subtitle += ` | Periodo: ${this.pdfBuilder.formatDate(
          filtros.dataInicio
        )} a ${this.pdfBuilder.formatDate(filtros.dataFim)}`;
      }
      if (filtros.usuario) {
        subtitle += ` | Usuario: ${filtros.usuario}`;
      }
      if (filtros.acao) {
        subtitle += ` | Acao: ${filtros.acao}`;
      }
    }

    this.generateListReport(
      'RELATORIO DE AUDITORIA',
      subtitle,
      [
        {
          header: 'Data/Hora',
          field: 'createdAt',
          width: 40,
        },
        {
          header: 'Usuario',
          field: 'usuarioNome',
          width: 50,
        },
        {
          header: 'Acao',
          field: 'acao',
          width: 40,
        },
        {
          header: 'Recurso',
          field: 'recurso',
          width: 40,
        },
      ],
      logs.map((log) => ({
        ...log,
        createdAt: this.pdfBuilder.formatDateTime(log.createdAt),
      })),
      `auditoria_${new Date().getTime()}.pdf`
    );
  }

  /**
   * Gera relatorio de acoes por usuario
   */
  generateAcoesPorUsuarioReport(dados: {
    usuario: string;
    periodo: string;
    totalAcoes: number;
    acoesPorTipo: { tipo: string; quantidade: number }[];
    logs: AuditoriaData[];
  }): void {
    this.generateAnalyticsReport(
      'RELATORIO DE ACOES POR USUARIO',
      `Usuario: ${dados.usuario} | Periodo: ${dados.periodo}`,
      [
        {
          label: 'Total de Acoes',
          value: dados.totalAcoes,
          color: [59, 130, 246],
        },
        ...dados.acoesPorTipo.slice(0, 5).map((item, index) => ({
          label: item.tipo,
          value: item.quantidade,
          color: [
            [34, 197, 94],
            [251, 146, 60],
            [139, 92, 246],
            [236, 72, 153],
            [14, 165, 233],
          ][index] as [number, number, number],
        })),
      ],
      `acoes_usuario_${new Date().getTime()}.pdf`,
      [
        {
          title: 'Detalhamento de Acoes',
          columns: [
            { header: 'Data/Hora', field: 'createdAt' },
            { header: 'Acao', field: 'acao' },
            { header: 'Recurso', field: 'recurso' },
          ],
          data: dados.logs.slice(0, 50).map((log) => ({
            ...log,
            createdAt: this.pdfBuilder.formatDateTime(log.createdAt),
          })),
        },
      ]
    );
  }

  /**
   * Gera relatorio estatistico de atividades do sistema
   */
  generateEstatisticasReport(dados: {
    periodo: string;
    totalUsuarios: number;
    totalAcoes: number;
    acoesComuns: { acao: string; quantidade: number }[];
    recursosAcessados: { recurso: string; quantidade: number }[];
    usuariosAtivos: { usuario: string; acoes: number }[];
  }): void {
    this.generateAnalyticsReport(
      'ESTATISTICAS DO SISTEMA',
      dados.periodo,
      [
        {
          label: 'Usuarios Ativos',
          value: dados.totalUsuarios,
          color: [59, 130, 246],
        },
        {
          label: 'Total de Acoes',
          value: dados.totalAcoes,
          color: [34, 197, 94],
        },
        {
          label: 'Media Acoes/Usuario',
          value: Math.round(dados.totalAcoes / dados.totalUsuarios),
          color: [251, 146, 60],
        },
      ],
      `estatisticas_sistema_${new Date().getTime()}.pdf`,
      [
        {
          title: 'Acoes Mais Comuns',
          columns: [
            { header: 'Acao', field: 'acao' },
            { header: 'Quantidade', field: 'quantidade' },
          ],
          data: dados.acoesComuns.slice(0, 10),
        },
        {
          title: 'Recursos Mais Acessados',
          columns: [
            { header: 'Recurso', field: 'recurso' },
            { header: 'Acessos', field: 'quantidade' },
          ],
          data: dados.recursosAcessados.slice(0, 10),
        },
        {
          title: 'Usuarios Mais Ativos',
          columns: [
            { header: 'Usuario', field: 'usuario' },
            { header: 'Acoes', field: 'acoes' },
          ],
          data: dados.usuariosAtivos.slice(0, 10),
        },
      ]
    );
  }
}

// Servico especializado para relatorios de auditoria
// Gera relatorios de logs, estatisticas e atividades do sistema
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
