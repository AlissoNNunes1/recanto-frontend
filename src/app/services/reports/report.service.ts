import { Injectable } from '@angular/core';
import { PdfBuilderService } from './pdf-builder.service';

/**
 * Servico base generico para geracao de relatorios
 * Define interface padrao para todos os tipos de relatorios
 */
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(protected pdfBuilder: PdfBuilderService) {}

  /**
   * Gera relatorio de lista generica
   * Util para listagens de residentes, funcionarios, etc
   */
  generateListReport(
    title: string,
    subtitle: string,
    columns: { header: string; field: string; width?: number }[],
    data: any[],
    filename: string
  ): void {
    const doc = this.pdfBuilder.createDocument();

    // Cabecalho
    let yPosition = this.pdfBuilder.addHeader(doc, title, subtitle);
    yPosition += 5;

    // Tabela
    yPosition = this.pdfBuilder.addTable(doc, {
      columns,
      data,
      startY: yPosition,
      alternateRowColor: true,
    });

    // Rodape
    this.pdfBuilder.addFooter(doc, 'Sistema Recanto da Vovo');

    // Salvar
    this.pdfBuilder.saveDocument(doc, filename);
  }

  /**
   * Gera relatorio detalhado de uma entidade
   * Util para visualizacao detalhada de qualquer registro
   */
  generateDetailReport(
    title: string,
    subtitle: string,
    sections: {
      title: string;
      fields: { label: string; value: any }[];
    }[],
    filename: string
  ): void {
    const doc = this.pdfBuilder.createDocument();

    // Cabecalho
    let yPosition = this.pdfBuilder.addHeader(doc, title, subtitle);
    yPosition += 5;

    // Secoes
    sections.forEach((section) => {
      yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 30);

      // Titulo da secao
      yPosition = this.pdfBuilder.addSection(doc, section.title, yPosition, {
        fontSize: 12,
        color: [59, 130, 246],
      });
      yPosition += 3;

      // Campos da secao
      section.fields.forEach((field) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${field.label}:`, 20, yPosition);

        doc.setFont('helvetica', 'normal');
        const value =
          field.value !== undefined && field.value !== null
            ? String(field.value)
            : 'N/A';
        doc.text(value, 70, yPosition);

        yPosition += 5;
      });

      yPosition += 5;
    });

    // Rodape
    this.pdfBuilder.addFooter(doc, 'Sistema Recanto da Vovo');

    // Salvar
    this.pdfBuilder.saveDocument(doc, filename);
  }

  /**
   * Gera relatorio com graficos e metricas
   * Util para dashboards e relatorios estatisticos
   */
  generateAnalyticsReport(
    title: string,
    subtitle: string,
    metrics: {
      label: string;
      value: string | number;
      color?: [number, number, number];
    }[],
    filename: string,
    tables?: {
      title: string;
      columns: { header: string; field: string }[];
      data: any[];
    }[]
  ): void {
    const doc = this.pdfBuilder.createDocument();

    // Cabecalho
    let yPosition = this.pdfBuilder.addHeader(doc, title, subtitle);
    yPosition += 10;

    // Cards de metricas
    const cardWidth = 50;
    const cardHeight = 25;
    const spacing = 5;
    let xPosition = 20;

    metrics.forEach((metric, index) => {
      if (index > 0 && index % 3 === 0) {
        yPosition += cardHeight + spacing;
        xPosition = 20;
      }

      const content = `${metric.value}`;
      yPosition = this.pdfBuilder.addCard(
        doc,
        xPosition,
        yPosition,
        cardWidth,
        cardHeight,
        content,
        metric.label
      );

      xPosition += cardWidth + spacing;

      if (index % 3 === 2) {
        yPosition -= cardHeight + spacing;
      }
    });

    yPosition += 10;

    // Tabelas (se fornecidas)
    if (tables && tables.length > 0) {
      tables.forEach((table) => {
        yPosition = this.pdfBuilder.checkPageBreak(doc, yPosition, 50);

        yPosition = this.pdfBuilder.addSection(doc, table.title, yPosition, {
          fontSize: 12,
        });
        yPosition += 5;

        yPosition = this.pdfBuilder.addTable(doc, {
          columns: table.columns,
          data: table.data,
          startY: yPosition,
          alternateRowColor: true,
        });

        yPosition += 5;
      });
    }

    // Rodape
    this.pdfBuilder.addFooter(doc, 'Sistema Recanto da Vovo');

    // Salvar
    this.pdfBuilder.saveDocument(doc, filename);
  }

  /**
   * Gera relatorio customizado
   * Permite controle total sobre a estrutura do documento
   */
  generateCustomReport(
    builderFn: (doc: any, builder: PdfBuilderService) => void,
    filename: string
  ): void {
    const doc = this.pdfBuilder.createDocument();
    builderFn(doc, this.pdfBuilder);
    this.pdfBuilder.addFooter(doc, 'Sistema Recanto da Vovo');
    this.pdfBuilder.saveDocument(doc, filename);
  }
}

// Servico base generico para geracao de relatorios em PDF
// Fornece metodos padronizados para diferentes tipos de relatorios
// Pode ser estendido por servicos especificos de cada modulo
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
