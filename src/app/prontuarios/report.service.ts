import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import {
  Consulta,
  Exame,
  MedicamentoPrescrito,
  ProntuarioEletronico,
} from './prontuario';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  generateProntuarioReport(
    prontuario: ProntuarioEletronico,
    consultas: Consulta[],
    exames: Exame[],
    medicamentos: MedicamentoPrescrito[]
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PRONTUARIO ELETRONICO', 105, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema Recanto da Vovo', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Informacoes do Paciente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO PACIENTE', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${prontuario.residente?.nome || 'N/A'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Status: ${prontuario.status}`, 20, yPosition);
    yPosition += 6;
    doc.text(
      `Criado em: ${this.formatDate(prontuario.createdAt)}`,
      20,
      yPosition
    );
    yPosition += 10;

    // Historico Medico
    if (prontuario.historicoMedico) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTORICO MEDICO', 20, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const historicoLines = doc.splitTextToSize(
        prontuario.historicoMedico,
        170
      );
      doc.text(historicoLines, 20, yPosition);
      yPosition += historicoLines.length * 5 + 5;
    }

    // Alergias
    if (prontuario.alergias) {
      const alergiasArray =
        typeof prontuario.alergias === 'string'
          ? prontuario.alergias.split(',').map((a) => a.trim())
          : prontuario.alergias;

      if (alergiasArray && alergiasArray.length > 0) {
        this.checkPageBreak(doc, yPosition, 20);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38); // Vermelho
        doc.text('ALERGIAS CONHECIDAS', 20, yPosition);
        doc.setTextColor(0, 0, 0); // Volta para preto
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        alergiasArray.forEach((alergia: string) => {
          doc.text(`- ${alergia}`, 25, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }
    }

    // Medicamentos de Uso Continuo
    if (prontuario.medicamentosContinuos) {
      const medicamentosArray =
        typeof prontuario.medicamentosContinuos === 'string'
          ? prontuario.medicamentosContinuos.split(',').map((m) => m.trim())
          : prontuario.medicamentosContinuos;

      if (medicamentosArray && medicamentosArray.length > 0) {
        this.checkPageBreak(doc, yPosition, 20);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDICAMENTOS DE USO CONTINUO', 20, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        medicamentosArray.forEach((med: string) => {
          doc.text(`- ${med}`, 25, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }
    }

    // Nova pagina para consultas
    doc.addPage();
    yPosition = 20;

    // Consultas
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORICO DE CONSULTAS', 20, yPosition);
    yPosition += 10;

    if (consultas.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhuma consulta registrada', 20, yPosition);
      yPosition += 10;
    } else {
      consultas.forEach((consulta, index) => {
        this.checkPageBreak(doc, yPosition, 50);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Consulta ${index + 1}`, 20, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Data: ${this.formatDate(consulta.dataConsulta)}`,
          20,
          yPosition
        );
        yPosition += 5;
        doc.text(`Tipo: ${consulta.tipoConsulta}`, 20, yPosition);
        yPosition += 5;

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

    // Nova pagina para exames
    doc.addPage();
    yPosition = 20;

    // Exames
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HISTORICO DE EXAMES', 20, yPosition);
    yPosition += 10;

    if (exames.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum exame registrado', 20, yPosition);
      yPosition += 10;
    } else {
      exames.forEach((exame, index) => {
        this.checkPageBreak(doc, yPosition, 40);

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
          `Solicitado em: ${this.formatDate(exame.dataSolicitacao)}`,
          20,
          yPosition
        );
        yPosition += 5;

        if (exame.resultado) {
          doc.text(`Resultado: ${exame.resultado}`, 20, yPosition);
          yPosition += 5;
        }

        yPosition += 5;
      });
    }

    // Nova pagina para medicamentos
    doc.addPage();
    yPosition = 20;

    // Medicamentos Prescritos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAMENTOS PRESCRITOS', 20, yPosition);
    yPosition += 10;

    if (medicamentos.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Nenhum medicamento prescrito', 20, yPosition);
    } else {
      medicamentos.forEach((medicamento, index) => {
        this.checkPageBreak(doc, yPosition, 50);

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
        doc.text(
          `Inicio: ${this.formatDate(medicamento.dataInicio)}`,
          20,
          yPosition
        );
        yPosition += 5;

        if (medicamento.dataFim) {
          doc.text(
            `Fim: ${this.formatDate(medicamento.dataFim)}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        yPosition += 5;
      });
    }

    // Rodape com data de geracao
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 285);
      doc.text(`Pagina ${i} de ${totalPages}`, 170, 285);
    }

    // Salvar PDF
    const fileName = `prontuario_${
      prontuario.residente?.nome || 'paciente'
    }_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  private checkPageBreak(
    doc: jsPDF,
    yPosition: number,
    requiredSpace: number
  ): number {
    if (yPosition + requiredSpace > 280) {
      doc.addPage();
      return 20;
    }
    return yPosition;
  }

  private formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }
}

// Servico de geracao de relatorios PDF
// Utiliza jsPDF para criar documentos formatados
// Gera relatorios completos de prontuarios eletronicos
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
