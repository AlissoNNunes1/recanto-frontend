import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

// Interface para configuracao de pagina
export interface PageConfig {
  orientation?: 'portrait' | 'landscape';
  unit?: 'pt' | 'mm' | 'cm' | 'in';
  format?: string | number[];
  compress?: boolean;
}

// Interface para estilo de texto
export interface TextStyle {
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
  color?: [number, number, number];
  align?: 'left' | 'center' | 'right' | 'justify';
}

// Interface para tabela
export interface TableColumn {
  header: string;
  field: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

// Interface para configuracao de tabela
export interface TableConfig {
  columns: TableColumn[];
  data: any[];
  startY?: number;
  headerStyle?: TextStyle;
  rowStyle?: TextStyle;
  alternateRowColor?: boolean;
}

/**
 * Servico base para construcao de PDFs
 * Fornece metodos utilitarios genericos para criacao de documentos
 */
@Injectable({
  providedIn: 'root',
})
export class PdfBuilderService {
  // Margens padrao
  private readonly MARGIN_LEFT = 20;
  private readonly MARGIN_RIGHT = 20;
  private readonly MARGIN_TOP = 20;
  private readonly MARGIN_BOTTOM = 20;
  private readonly PAGE_HEIGHT = 297; // A4 em mm

  constructor() {}

  /**
   * Cria nova instancia de jsPDF
   */
  createDocument(config: PageConfig = {}): jsPDF {
    return new jsPDF({
      orientation: config.orientation || 'portrait',
      unit: config.unit || 'mm',
      format: config.format || 'a4',
      compress: config.compress !== false,
    });
  }

  /**
   * Adiciona cabecalho padrao ao documento
   */
  addHeader(
    doc: jsPDF,
    title: string,
    subtitle?: string,
    logoPath?: string
  ): number {
    let yPosition = this.MARGIN_TOP;

    // Logo (se fornecido)
    if (logoPath) {
      // TODO: Implementar adicao de logo
      yPosition += 15;
    }

    // Titulo principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, yPosition, { align: 'center' });
    yPosition += 8;

    // Subtitulo
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 105, yPosition, { align: 'center' });
      yPosition += 6;
    }

    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(this.MARGIN_LEFT, yPosition, 190, yPosition);
    yPosition += 8;

    return yPosition;
  }

  /**
   * Adiciona rodape com numeracao de paginas
   */
  addFooter(doc: jsPDF, customText?: string): void {
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);

      // Data de geracao
      const timestamp = new Date().toLocaleString('pt-BR');
      doc.text(`Gerado em: ${timestamp}`, this.MARGIN_LEFT, 285);

      // Numeracao de paginas
      doc.text(`Pagina ${i} de ${totalPages}`, 170, 285);

      // Texto customizado (se fornecido)
      if (customText) {
        doc.text(customText, 105, 285, { align: 'center' });
      }

      doc.setTextColor(0, 0, 0);
    }
  }

  /**
   * Adiciona texto com estilo
   */
  addText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    style: TextStyle = {}
  ): number {
    // Aplicar estilo
    if (style.fontSize) doc.setFontSize(style.fontSize);
    if (style.fontStyle) doc.setFont('helvetica', style.fontStyle);
    if (style.color) doc.setTextColor(...style.color);

    // Adicionar texto
    if (style.align) {
      doc.text(text, x, y, { align: style.align });
    } else {
      doc.text(text, x, y);
    }

    // Resetar cor
    doc.setTextColor(0, 0, 0);

    return y + (style.fontSize || 10) * 0.5;
  }

  /**
   * Adiciona paragrafo com quebra automatica de linha
   */
  addParagraph(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    style: TextStyle = {}
  ): number {
    if (style.fontSize) doc.setFontSize(style.fontSize);
    if (style.fontStyle) doc.setFont('helvetica', style.fontStyle);
    if (style.color) doc.setTextColor(...style.color);

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);

    doc.setTextColor(0, 0, 0);

    return y + lines.length * (style.fontSize || 10) * 0.5;
  }

  /**
   * Adiciona secao com titulo
   */
  addSection(
    doc: jsPDF,
    title: string,
    y: number,
    style: TextStyle = {}
  ): number {
    const fontSize = style.fontSize || 12;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');

    if (style.color) {
      doc.setTextColor(...style.color);
    }

    doc.text(title, this.MARGIN_LEFT, y);
    doc.setTextColor(0, 0, 0);

    return y + fontSize * 0.6;
  }

  /**
   * Adiciona tabela generica
   */
  addTable(doc: jsPDF, config: TableConfig): number {
    let y = config.startY || 40;
    const tableWidth = 170;
    const columnWidths = this.calculateColumnWidths(config.columns, tableWidth);

    // Cabecalho da tabela
    doc.setFillColor(59, 130, 246); // Azul
    doc.rect(this.MARGIN_LEFT, y, tableWidth, 8, 'F');

    doc.setFontSize(config.headerStyle?.fontSize || 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    let xPosition = this.MARGIN_LEFT + 2;
    config.columns.forEach((col, index) => {
      doc.text(col.header, xPosition, y + 5.5);
      xPosition += columnWidths[index];
    });

    y += 8;
    doc.setTextColor(0, 0, 0);

    // Linhas de dados
    doc.setFontSize(config.rowStyle?.fontSize || 8);
    doc.setFont('helvetica', 'normal');

    config.data.forEach((row, rowIndex) => {
      // Verificar quebra de pagina
      if (y > 270) {
        doc.addPage();
        y = this.MARGIN_TOP;
      }

      // Cor alternada
      if (config.alternateRowColor && rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(this.MARGIN_LEFT, y, tableWidth, 6, 'F');
      }

      xPosition = this.MARGIN_LEFT + 2;
      config.columns.forEach((col, colIndex) => {
        const value =
          row[col.field] !== undefined ? String(row[col.field]) : '';
        const align = col.align || 'left';

        if (align === 'center') {
          doc.text(value, xPosition + columnWidths[colIndex] / 2, y + 4, {
            align: 'center',
          });
        } else if (align === 'right') {
          doc.text(value, xPosition + columnWidths[colIndex] - 2, y + 4, {
            align: 'right',
          });
        } else {
          doc.text(value, xPosition, y + 4);
        }

        xPosition += columnWidths[colIndex];
      });

      y += 6;
    });

    return y + 5;
  }

  /**
   * Calcula larguras das colunas proporcionalmente
   */
  private calculateColumnWidths(
    columns: TableColumn[],
    totalWidth: number
  ): number[] {
    const widths: number[] = [];
    let totalDefinedWidth = 0;
    let columnsWithoutWidth = 0;

    // Calcular total de larguras definidas
    columns.forEach((col) => {
      if (col.width) {
        totalDefinedWidth += col.width;
      } else {
        columnsWithoutWidth++;
      }
    });

    // Distribuir largura restante
    const remainingWidth = totalWidth - totalDefinedWidth;
    const defaultWidth =
      columnsWithoutWidth > 0 ? remainingWidth / columnsWithoutWidth : 0;

    columns.forEach((col) => {
      widths.push(col.width || defaultWidth);
    });

    return widths;
  }

  /**
   * Adiciona lista com marcadores
   */
  addList(
    doc: jsPDF,
    items: string[],
    x: number,
    y: number,
    bulletChar: string = '-'
  ): number {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    items.forEach((item) => {
      doc.text(`${bulletChar} ${item}`, x, y);
      y += 5;

      // Verificar quebra de pagina
      if (y > 270) {
        doc.addPage();
        y = this.MARGIN_TOP;
      }
    });

    return y + 3;
  }

  /**
   * Adiciona card com borda
   */
  addCard(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    content: string,
    title?: string
  ): number {
    // Borda do card
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(x, y, width, height, 2, 2, 'FD');

    let currentY = y + 5;

    // Titulo do card (se fornecido)
    if (title) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(title, x + 3, currentY);
      currentY += 6;
    }

    // Conteudo
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(content, width - 6);
    doc.text(lines, x + 3, currentY);

    return y + height + 3;
  }

  /**
   * Verifica se precisa de quebra de pagina
   */
  checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number): number {
    if (currentY + requiredSpace > 280) {
      doc.addPage();
      return this.MARGIN_TOP;
    }
    return currentY;
  }

  /**
   * Formata data para padrao brasileiro
   */
  formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  /**
   * Formata data e hora para padrao brasileiro
   */
  formatDateTime(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
  }

  /**
   * Adiciona linha separadora
   */
  addDivider(
    doc: jsPDF,
    y: number,
    color: [number, number, number] = [200, 200, 200]
  ): number {
    doc.setDrawColor(...color);
    doc.line(this.MARGIN_LEFT, y, 190, y);
    return y + 3;
  }

  /**
   * Salva o documento
   */
  saveDocument(doc: jsPDF, filename: string): void {
    doc.save(filename);
  }

  /**
   * Retorna blob do documento para download
   */
  getBlob(doc: jsPDF): Blob {
    return doc.output('blob');
  }

  /**
   * Abre o documento em nova aba
   */
  openInNewTab(doc: jsPDF): void {
    const blob = this.getBlob(doc);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}

// Servico de construcao de PDFs com metodos utilitarios genericos
// Fornece funcionalidades base para criacao de documentos PDF
// Pode ser estendido por servicos especificos de relatorios
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
