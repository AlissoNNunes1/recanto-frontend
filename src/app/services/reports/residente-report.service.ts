import { Injectable } from '@angular/core';
import { PdfBuilderService } from './pdf-builder.service';
import { ReportService } from './report.service';

// Interface para dados de residente
interface ResidenteData {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento?: Date;
  dataAdmissao?: Date;
  status: string;
  telefone?: string;
  email?: string;
  responsavelNome?: string;
  responsavelTelefone?: string;
}

/**
 * Servico especializado para relatorios de residentes
 */
@Injectable({
  providedIn: 'root',
})
export class ResidenteReportService extends ReportService {
  constructor(protected override pdfBuilder: PdfBuilderService) {
    super(pdfBuilder);
  }

  /**
   * Gera relatorio de lista de residentes
   */
  generateResidentesListReport(residentes: ResidenteData[]): void {
    this.generateListReport(
      'LISTA DE RESIDENTES',
      `Total: ${residentes.length} residentes`,
      [
        { header: 'ID', field: 'id', width: 20 },
        { header: 'Nome', field: 'nome', width: 80 },
        { header: 'CPF', field: 'cpf', width: 40 },
        { header: 'Status', field: 'status', width: 30 },
      ],
      residentes,
      `residentes_${new Date().getTime()}.pdf`
    );
  }

  /**
   * Gera relatorio detalhado de um residente
   */
  generateResidenteDetailReport(residente: ResidenteData): void {
    this.generateDetailReport(
      'FICHA DO RESIDENTE',
      residente.nome,
      [
        {
          title: 'Dados Pessoais',
          fields: [
            { label: 'ID', value: residente.id },
            { label: 'Nome Completo', value: residente.nome },
            { label: 'CPF', value: residente.cpf },
            {
              label: 'Data de Nascimento',
              value: this.pdfBuilder.formatDate(residente.dataNascimento),
            },
            {
              label: 'Data de Admissao',
              value: this.pdfBuilder.formatDate(residente.dataAdmissao),
            },
            { label: 'Status', value: residente.status },
          ],
        },
        {
          title: 'Contatos',
          fields: [
            { label: 'Telefone', value: residente.telefone },
            { label: 'E-mail', value: residente.email },
          ],
        },
        {
          title: 'Responsavel',
          fields: [
            { label: 'Nome', value: residente.responsavelNome },
            { label: 'Telefone', value: residente.responsavelTelefone },
          ],
        },
      ],
      `residente_${residente.id}_${new Date().getTime()}.pdf`
    );
  }

  /**
   * Gera relatorio de aniversariantes do mes
   */
  generateAniversariantesReport(
    mes: number,
    ano: number,
    residentes: ResidenteData[]
  ): void {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Marco',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    this.generateListReport(
      'ANIVERSARIANTES DO MES',
      `${meses[mes - 1]} de ${ano}`,
      [
        { header: 'Nome', field: 'nome', width: 100 },
        { header: 'Data de Nascimento', field: 'dataNascimento', width: 50 },
        { header: 'Telefone', field: 'telefone', width: 40 },
      ],
      residentes,
      `aniversariantes_${mes}_${ano}.pdf`
    );
  }
}

// Servico especializado para relatorios de residentes
// Gera listas, fichas e relatorios estatisticos
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
