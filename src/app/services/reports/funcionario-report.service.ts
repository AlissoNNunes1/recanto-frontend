import { Injectable } from '@angular/core';
import { PdfBuilderService } from './pdf-builder.service';
import { ReportService } from './report.service';

// Interface para dados de funcionario
interface FuncionarioData {
  id: number;
  nome: string;
  cpf?: string;
  funcao: string;
  turno?: string;
  dataAdmissao?: Date;
  dataDemissao?: Date;
  status: string;
  telefone?: string;
  email?: string;
}

/**
 * Servico especializado para relatorios de funcionarios
 */
@Injectable({
  providedIn: 'root',
})
export class FuncionarioReportService extends ReportService {
  constructor(protected override pdfBuilder: PdfBuilderService) {
    super(pdfBuilder);
  }

  /**
   * Gera relatorio de lista de funcionarios
   */
  generateFuncionariosListReport(funcionarios: FuncionarioData[]): void {
    this.generateListReport(
      'LISTA DE FUNCIONARIOS',
      `Total: ${funcionarios.length} funcionarios`,
      [
        { header: 'ID', field: 'id', width: 20 },
        { header: 'Nome', field: 'nome', width: 70 },
        { header: 'Funcao', field: 'funcao', width: 40 },
        { header: 'Turno', field: 'turno', width: 30 },
        { header: 'Status', field: 'status', width: 30 },
      ],
      funcionarios,
      `funcionarios_${new Date().getTime()}.pdf`
    );
  }

  /**
   * Gera relatorio detalhado de um funcionario
   */
  generateFuncionarioDetailReport(funcionario: FuncionarioData): void {
    this.generateDetailReport(
      'FICHA DO FUNCIONARIO',
      funcionario.nome,
      [
        {
          title: 'Dados Pessoais',
          fields: [
            { label: 'ID', value: funcionario.id },
            { label: 'Nome Completo', value: funcionario.nome },
            { label: 'CPF', value: funcionario.cpf },
            { label: 'Telefone', value: funcionario.telefone },
            { label: 'E-mail', value: funcionario.email },
          ],
        },
        {
          title: 'Dados Profissionais',
          fields: [
            { label: 'Funcao', value: funcionario.funcao },
            { label: 'Turno', value: funcionario.turno },
            {
              label: 'Data de Admissao',
              value: this.pdfBuilder.formatDate(funcionario.dataAdmissao),
            },
            {
              label: 'Data de Demissao',
              value: this.pdfBuilder.formatDate(funcionario.dataDemissao),
            },
            { label: 'Status', value: funcionario.status },
          ],
        },
      ],
      `funcionario_${funcionario.id}_${new Date().getTime()}.pdf`
    );
  }

  /**
   * Gera relatorio de escala de funcionarios
   */
  generateEscalaReport(
    periodo: string,
    escalas: { data: string; turno: string; funcionario: string }[]
  ): void {
    this.generateListReport(
      'ESCALA DE FUNCIONARIOS',
      periodo,
      [
        { header: 'Data', field: 'data', width: 40 },
        { header: 'Turno', field: 'turno', width: 40 },
        { header: 'Funcionario', field: 'funcionario', width: 90 },
      ],
      escalas,
      `escala_${new Date().getTime()}.pdf`
    );
  }

  /**
   * Gera relatorio de funcionarios por turno
   */
  generateFuncionariosPorTurnoReport(funcionarios: FuncionarioData[]): void {
    // Agrupar por turno
    const manha = funcionarios.filter((f) => f.turno === 'MANHA');
    const tarde = funcionarios.filter((f) => f.turno === 'TARDE');
    const noite = funcionarios.filter((f) => f.turno === 'NOITE');

    this.generateAnalyticsReport(
      'FUNCIONARIOS POR TURNO',
      'Distribuicao de funcionarios por periodo de trabalho',
      [
        {
          label: 'Manha',
          value: manha.length,
          color: [59, 130, 246],
        },
        {
          label: 'Tarde',
          value: tarde.length,
          color: [251, 146, 60],
        },
        {
          label: 'Noite',
          value: noite.length,
          color: [139, 92, 246],
        },
      ],
      `funcionarios_por_turno_${new Date().getTime()}.pdf`,
      [
        {
          title: 'Turno da Manha',
          columns: [
            { header: 'Nome', field: 'nome' },
            { header: 'Funcao', field: 'funcao' },
          ],
          data: manha,
        },
        {
          title: 'Turno da Tarde',
          columns: [
            { header: 'Nome', field: 'nome' },
            { header: 'Funcao', field: 'funcao' },
          ],
          data: tarde,
        },
        {
          title: 'Turno da Noite',
          columns: [
            { header: 'Nome', field: 'nome' },
            { header: 'Funcao', field: 'funcao' },
          ],
          data: noite,
        },
      ]
    );
  }
}

// Servico especializado para relatorios de funcionarios
// Gera listas, fichas, escalas e relatorios de recursos humanos
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
