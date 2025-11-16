import { Injectable } from '@angular/core';
import {
  Consulta,
  Exame,
  MedicamentoPrescrito,
  ProntuarioEletronico,
} from '../../prontuarios/prontuario';
import { Anexo } from '../anexos.service';
import { PdfBuilderService } from './pdf-builder.service';
import { ReportService } from './report.service';

/**
 * Servico especializado para relatorios de prontuarios
 * Contem logica especifica para documentos medicos
 */
@Injectable({
  providedIn: 'root',
})
export class ProntuarioReportService extends ReportService {
  constructor(protected override pdfBuilder: PdfBuilderService) {
    super(pdfBuilder);
  }

  /**
   * Gera relatorio completo do prontuario eletronico
   */
  generateProntuarioReport(
    prontuario: ProntuarioEletronico,
    consultas: Consulta[],
    exames: Exame[],
    medicamentos: MedicamentoPrescrito[],
    anexos: Anexo[] = []
  ): void {
    const doc = this.pdfBuilder.createDocument();
    let yPosition = 20;

    // Header
    yPosition = this.pdfBuilder.addHeader(
      doc,
      'PRONTUARIO ELETRONICO',
      'Sistema Recanto da Vovo'
    );
    yPosition += 5;

    // Informacoes do Paciente
    yPosition = this.addPatientInfo(doc, prontuario, yPosition);

    // Historico Medico
    if (prontuario.historicoMedico) {
      yPosition = this.addMedicalHistory(
        doc,
        prontuario.historicoMedico,
        yPosition
      );
    }

    // Alergias
    if (prontuario.alergias) {
      yPosition = this.addAllergies(doc, prontuario.alergias, yPosition);
    }

    // Medicamentos de Uso Continuo
    if (prontuario.medicamentosContinuos) {
      yPosition = this.addContinuousMedications(
        doc,
        prontuario.medicamentosContinuos,
        yPosition
      );
    }

    // Nova pagina para consultas
    doc.addPage();
    yPosition = 20;
    yPosition = this.addConsultas(doc, consultas, yPosition);

    // Nova pagina para exames
    doc.addPage();
    yPosition = 20;
    yPosition = this.addExames(doc, exames, yPosition);

    // Nova pagina para medicamentos
    doc.addPage();
    yPosition = 20;
    yPosition = this.addMedicamentos(doc, medicamentos, yPosition);

    // Nova pagina para anexos
    doc.addPage();
    yPosition = 20;
    yPosition = this.addAnexos(doc, anexos, yPosition);

    // Rodape
    this.pdfBuilder.addFooter(doc);

    // Salvar
    const fileName = `prontuario_${
      prontuario.residente?.nome || 'paciente'
    }_${new Date().getTime()}.pdf`;
    this.pdfBuilder.saveDocument(doc, fileName);
  }

  /**
   * Adiciona informacoes do paciente
   */
  private addPatientInfo(
    doc: any,
    prontuario: ProntuarioEletronico,
    yPosition: number
  ): number {
    yPosition = this.pdfBuilder.addSection(
      doc,
      'DADOS DO PACIENTE',
      yPosition,
      { fontSize: 14 }
    );
    yPosition += 2;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${prontuario.residente?.nome || 'N/A'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Status: ${prontuario.status}`, 20, yPosition);
    yPosition += 6;
    doc.text(
      `Criado em: ${this.pdfBuilder.formatDate(prontuario.createdAt)}`,
      20,
      yPosition
    );
    yPosition += 10;

    return yPosition;
  }

  /**
   * Adiciona historico medico
   */
  private addMedicalHistory(
    doc: any,
    historicoMedico: string,
    yPosition: number
  ): number {
    yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 20);
    yPosition = this.pdfBuilder.addSection(doc, 'HISTORICO MEDICO', yPosition, {
      fontSize: 12,
    });
    yPosition += 2;

    yPosition = this.pdfBuilder.addParagraph(
      doc,
      historicoMedico,
      20,
      yPosition,
      170,
      { fontSize: 9 }
    );
    yPosition += 5;

    return yPosition;
  }

  /**
   * Adiciona alergias conhecidas
   */
  private addAllergies(doc: any, alergias: any, yPosition: number): number {
    const alergiasArray =
      typeof alergias === 'string'
        ? alergias.split(',').map((a) => a.trim())
        : alergias;

    if (alergiasArray && alergiasArray.length > 0) {
      yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 20);

      yPosition = this.pdfBuilder.addSection(
        doc,
        'ALERGIAS CONHECIDAS',
        yPosition,
        {
          fontSize: 12,
          color: [220, 38, 38],
        }
      );
      yPosition += 2;

      yPosition = this.pdfBuilder.addList(doc, alergiasArray, 25, yPosition);
      yPosition += 5;
    }

    return yPosition;
  }

  /**
   * Adiciona medicamentos de uso continuo
   */
  private addContinuousMedications(
    doc: any,
    medicamentosContinuos: any,
    yPosition: number
  ): number {
    const medicamentosArray =
      typeof medicamentosContinuos === 'string'
        ? medicamentosContinuos.split(',').map((m) => m.trim())
        : medicamentosContinuos;

    if (medicamentosArray && medicamentosArray.length > 0) {
      yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 20);

      yPosition = this.pdfBuilder.addSection(
        doc,
        'MEDICAMENTOS DE USO CONTINUO',
        yPosition,
        { fontSize: 12 }
      );
      yPosition += 2;

      yPosition = this.pdfBuilder.addList(
        doc,
        medicamentosArray,
        25,
        yPosition
      );
      yPosition += 5;
    }

    return yPosition;
  }

  /**
   * Adiciona historico de consultas
   */
  private addConsultas(
    doc: any,
    consultas: Consulta[],
    yPosition: number
  ): number {
    yPosition = this.pdfBuilder.addSection(
      doc,
      'HISTORICO DE CONSULTAS',
      yPosition,
      { fontSize: 14 }
    );
    yPosition += 5;

    if (consultas.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhuma consulta registrada', 20, yPosition);
      yPosition += 10;
    } else {
      consultas.forEach((consulta, index) => {
        yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 55);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Consulta ${index + 1}`, 20, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Data: ${this.pdfBuilder.formatDate(consulta.dataConsulta)}`,
          20,
          yPosition
        );
        yPosition += 5;
        doc.text(`Tipo: ${consulta.tipoConsulta}`, 20, yPosition);
        yPosition += 5;

        if (consulta.profissional?.nome) {
          doc.text(
            `Profissional: ${consulta.profissional.nome}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        if (consulta.queixaPrincipal) {
          doc.text(`Queixa: ${consulta.queixaPrincipal}`, 20, yPosition);
          yPosition += 5;
        }

        if (consulta.diagnostico) {
          doc.text(`Diagnostico: ${consulta.diagnostico}`, 20, yPosition);
          yPosition += 5;
        }

        yPosition += 5;
      });
    }

    return yPosition;
  }

  /**
   * Adiciona historico de exames
   */
  private addExames(doc: any, exames: Exame[], yPosition: number): number {
    yPosition = this.pdfBuilder.addSection(
      doc,
      'HISTORICO DE EXAMES',
      yPosition,
      { fontSize: 14 }
    );
    yPosition += 5;

    if (exames.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum exame registrado', 20, yPosition);
      yPosition += 10;
    } else {
      exames.forEach((exame, index) => {
        yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 45);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Exame ${index + 1}`, 20, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nome: ${exame.nomeExame}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Tipo: ${exame.tipoExame}`, 20, yPosition);
        yPosition += 5;
        doc.text(
          `Realizado em: ${this.pdfBuilder.formatDate(exame.dataSolicitacao)}`,
          20,
          yPosition
        );
        yPosition += 5;

        if (exame.profissionalSolicitante?.nome) {
          doc.text(
            `Profissional: ${exame.profissionalSolicitante.nome}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        if (exame.resultado) {
          doc.text(`Resultado: ${exame.resultado}`, 20, yPosition);
          yPosition += 5;
        }

        yPosition += 5;
      });
    }

    return yPosition;
  }

  /**
   * Adiciona medicamentos prescritos
   */
  private addMedicamentos(
    doc: any,
    medicamentos: MedicamentoPrescrito[],
    yPosition: number
  ): number {
    yPosition = this.pdfBuilder.addSection(
      doc,
      'MEDICAMENTOS PRESCRITOS',
      yPosition,
      { fontSize: 14 }
    );
    yPosition += 5;

    if (medicamentos.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum medicamento prescrito', 20, yPosition);
    } else {
      medicamentos.forEach((medicamento, index) => {
        yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 60);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Medicamento ${index + 1}`, 20, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nome: ${medicamento.medicamentoNome}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Dosagem: ${medicamento.dosagem}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Via: ${medicamento.viaAdministracao}`, 20, yPosition);
        yPosition += 5;
        doc.text(
          `Frequencia: ${medicamento.frequenciaAdministracao}`,
          20,
          yPosition
        );
        yPosition += 5;

        if (medicamento.status) {
          const statusText = `Status: ${medicamento.status}`;
          if (medicamento.status === 'ATIVA') {
            doc.setTextColor(34, 197, 94);
          } else if (medicamento.status === 'SUSPENSA') {
            doc.setTextColor(234, 179, 8);
          } else if (medicamento.status === 'FINALIZADA') {
            doc.setTextColor(156, 163, 175);
          }
          doc.text(statusText, 20, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 5;
        }

        if (medicamento.profissional?.nome) {
          doc.text(
            `Profissional: ${medicamento.profissional.nome}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        doc.text(
          `Inicio: ${this.pdfBuilder.formatDate(medicamento.dataInicio)}`,
          20,
          yPosition
        );
        yPosition += 5;

        if (medicamento.dataFim) {
          doc.text(
            `Fim: ${this.pdfBuilder.formatDate(medicamento.dataFim)}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        yPosition += 5;
      });
    }

    return yPosition;
  }

  /**
   * Adiciona anexos e documentos
   */
  private addAnexos(doc: any, anexos: Anexo[], yPosition: number): number {
    yPosition = this.pdfBuilder.addSection(
      doc,
      'ANEXOS E DOCUMENTOS',
      yPosition,
      { fontSize: 14 }
    );
    yPosition += 5;

    if (anexos.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum anexo registrado', 20, yPosition);
      yPosition += 10;
    } else {
      const anexosConsultas = anexos.filter((a) => a.consultaId);
      const anexosExames = anexos.filter((a) => a.exameId);

      if (anexosConsultas.length > 0) {
        yPosition = this.pdfBuilder.addSection(
          doc,
          'Anexos de Consultas',
          yPosition,
          { fontSize: 12 }
        );
        yPosition += 3;

        anexosConsultas.forEach((anexo, index) => {
          yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 35);

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Anexo ${index + 1}`, 25, yPosition);
          yPosition += 5;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Arquivo: ${anexo.nomeArquivo}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Tipo: ${anexo.tipoAnexo}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Tamanho: ${anexo.tamanhoFormatado}`, 25, yPosition);
          yPosition += 5;
          doc.text(
            `Enviado em: ${this.pdfBuilder.formatDate(anexo.createdAt)}`,
            25,
            yPosition
          );
          yPosition += 5;

          if (anexo.descricao) {
            doc.text(`Descricao: ${anexo.descricao}`, 25, yPosition);
            yPosition += 5;
          }

          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Arquivo ID: ${anexo.id} - Solicitar acesso no sistema`,
            25,
            yPosition
          );
          doc.setTextColor(0, 0, 0);
          yPosition += 8;
        });
      }

      if (anexosExames.length > 0) {
        yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 15);

        yPosition = this.pdfBuilder.addSection(
          doc,
          'Anexos de Exames',
          yPosition,
          { fontSize: 12 }
        );
        yPosition += 3;

        anexosExames.forEach((anexo, index) => {
          yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 35);

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Anexo ${index + 1}`, 25, yPosition);
          yPosition += 5;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Arquivo: ${anexo.nomeArquivo}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Tipo: ${anexo.tipoAnexo}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Tamanho: ${anexo.tamanhoFormatado}`, 25, yPosition);
          yPosition += 5;
          doc.text(
            `Enviado em: ${this.pdfBuilder.formatDate(anexo.createdAt)}`,
            25,
            yPosition
          );
          yPosition += 5;

          if (anexo.descricao) {
            doc.text(`Descricao: ${anexo.descricao}`, 25, yPosition);
            yPosition += 5;
          }

          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Arquivo ID: ${anexo.id} - Solicitar acesso no sistema`,
            25,
            yPosition
          );
          doc.setTextColor(0, 0, 0);
          yPosition += 8;
        });
      }
    }

    return yPosition;
  }
}

// Servico especializado para relatorios de prontuarios eletronicos
// Contem logica especifica para documentos medicos e de saude
// Estende o servico base de relatorios com funcionalidades customizadas
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
