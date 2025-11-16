# Sistema de Relatorios Modular

## Visao Geral

Sistema modular e generico para geracao de relatorios PDF em todo o projeto. Utiliza jsPDF e fornece servicos especializados para cada tipo de relatorio.

---

## Estrutura de Arquivos

```
src/app/services/reports/
├── index.ts                          # Exportacoes centralizadas
├── pdf-builder.service.ts            # Construtor base de PDFs
├── report.service.ts                 # Servico base generico
├── prontuario-report.service.ts      # Relatorios de prontuarios
├── residente-report.service.ts       # Relatorios de residentes
├── funcionario-report.service.ts     # Relatorios de funcionarios
└── auditoria-report.service.ts       # Relatorios de auditoria
```

---

## Servicos Disponiveis

### 1. PdfBuilderService

**Proposito:** Fornece metodos utilitarios de baixo nivel para construcao de PDFs

**Metodos Principais:**

- `createDocument(config?)` - Cria nova instancia de jsPDF
- `addHeader(doc, title, subtitle?, logoPath?)` - Adiciona cabecalho padrao
- `addFooter(doc, customText?)` - Adiciona rodape com paginacao
- `addText(doc, text, x, y, style?)` - Adiciona texto com estilo
- `addParagraph(doc, text, x, y, maxWidth, style?)` - Adiciona paragrafo com quebra de linha
- `addSection(doc, title, y, style?)` - Adiciona titulo de secao
- `addTable(doc, config)` - Adiciona tabela generica
- `addList(doc, items, x, y, bulletChar?)` - Adiciona lista com marcadores
- `addCard(doc, x, y, width, height, content, title?)` - Adiciona card com borda
- `addDivider(doc, y, color?)` - Adiciona linha separadora
- `checkPageBreak(doc, currentY, requiredSpace)` - Verifica quebra de pagina
- `formatDate(date)` - Formata data para padrao brasileiro
- `formatDateTime(date)` - Formata data e hora para padrao brasileiro
- `saveDocument(doc, filename)` - Salva documento
- `getBlob(doc)` - Retorna blob para download
- `openInNewTab(doc)` - Abre documento em nova aba

**Exemplo de Uso:**

```typescript
import { PdfBuilderService } from '@services/reports';

constructor(private pdfBuilder: PdfBuilderService) {}

criarPDF() {
  const doc = this.pdfBuilder.createDocument();
  let y = this.pdfBuilder.addHeader(doc, 'Titulo', 'Subtitulo');

  y = this.pdfBuilder.addSection(doc, 'Secao 1', y);
  y = this.pdfBuilder.addText(doc, 'Algum texto aqui', 20, y);

  this.pdfBuilder.addFooter(doc);
  this.pdfBuilder.saveDocument(doc, 'relatorio.pdf');
}
```

---

### 2. ReportService (Base)

**Proposito:** Servico base generico com metodos padronizados para relatorios comuns

**Metodos Principais:**

- `generateListReport(title, subtitle, columns, data, filename)` - Gera relatorio de lista
- `generateDetailReport(title, subtitle, sections, filename)` - Gera relatorio detalhado
- `generateAnalyticsReport(title, subtitle, metrics, filename, tables?)` - Gera relatorio com metricas
- `generateCustomReport(builderFn, filename)` - Gera relatorio customizado

**Exemplo de Uso:**

```typescript
import { ReportService } from '@services/reports';

constructor(private reportService: ReportService) {}

gerarLista() {
  this.reportService.generateListReport(
    'Lista de Itens',
    'Total: 10 itens',
    [
      { header: 'ID', field: 'id', width: 20 },
      { header: 'Nome', field: 'nome', width: 100 },
      { header: 'Status', field: 'status', width: 50 }
    ],
    this.dados,
    'lista_itens.pdf'
  );
}

gerarDetalhes() {
  this.reportService.generateDetailReport(
    'Detalhes do Item',
    'Item #123',
    [
      {
        title: 'Informacoes Basicas',
        fields: [
          { label: 'ID', value: 123 },
          { label: 'Nome', value: 'Item Exemplo' },
          { label: 'Status', value: 'Ativo' }
        ]
      }
    ],
    'detalhes_item.pdf'
  );
}

gerarMetricas() {
  this.reportService.generateAnalyticsReport(
    'Dashboard',
    'Periodo: Janeiro 2025',
    [
      { label: 'Total de Usuarios', value: 50 },
      { label: 'Total de Acoes', value: 1250 },
      { label: 'Media por Usuario', value: 25 }
    ],
    'dashboard.pdf',
    [
      {
        title: 'Usuarios Ativos',
        columns: [
          { header: 'Nome', field: 'nome' },
          { header: 'Acoes', field: 'acoes' }
        ],
        data: this.usuariosAtivos
      }
    ]
  );
}
```

---

### 3. ProntuarioReportService

**Proposito:** Relatorios especializados para prontuarios eletronicos

**Metodos:**

- `generateProntuarioReport(prontuario, consultas, exames, medicamentos, anexos?)` - Gera relatorio completo do prontuario

**Exemplo de Uso:**

```typescript
import { ProntuarioReportService } from '@services/reports';

constructor(private prontuarioReport: ProntuarioReportService) {}

gerarRelatorio() {
  this.prontuarioReport.generateProntuarioReport(
    this.prontuario,
    this.consultas,
    this.exames,
    this.medicamentos,
    this.anexos
  );
}
```

---

### 4. ResidenteReportService

**Proposito:** Relatorios especializados para residentes

**Metodos:**

- `generateResidentesListReport(residentes)` - Lista de residentes
- `generateResidenteDetailReport(residente)` - Ficha detalhada do residente
- `generateAniversariantesReport(mes, ano, residentes)` - Lista de aniversariantes

**Exemplo de Uso:**

```typescript
import { ResidenteReportService } from '@services/reports';

constructor(private residenteReport: ResidenteReportService) {}

listarResidentes() {
  this.residenteReport.generateResidentesListReport(this.residentes);
}

fichaResidente(residente: any) {
  this.residenteReport.generateResidenteDetailReport(residente);
}

aniversariantesMes() {
  this.residenteReport.generateAniversariantesReport(
    11, // mes
    2025, // ano
    this.aniversariantes
  );
}
```

---

### 5. FuncionarioReportService

**Proposito:** Relatorios especializados para funcionarios

**Metodos:**

- `generateFuncionariosListReport(funcionarios)` - Lista de funcionarios
- `generateFuncionarioDetailReport(funcionario)` - Ficha detalhada do funcionario
- `generateEscalaReport(periodo, escalas)` - Escala de trabalho
- `generateFuncionariosPorTurnoReport(funcionarios)` - Relatorio por turno

**Exemplo de Uso:**

```typescript
import { FuncionarioReportService } from '@services/reports';

constructor(private funcionarioReport: FuncionarioReportService) {}

listarFuncionarios() {
  this.funcionarioReport.generateFuncionariosListReport(this.funcionarios);
}

escalaMensal() {
  this.funcionarioReport.generateEscalaReport(
    'Novembro 2025',
    this.escalas
  );
}

relatorioTurnos() {
  this.funcionarioReport.generateFuncionariosPorTurnoReport(this.funcionarios);
}
```

---

### 6. AuditoriaReportService

**Proposito:** Relatorios especializados para logs de auditoria

**Metodos:**

- `generateAuditoriaReport(logs, filtros?)` - Relatorio de logs
- `generateAcoesPorUsuarioReport(dados)` - Relatorio de acoes por usuario
- `generateEstatisticasReport(dados)` - Relatorio estatistico do sistema

**Exemplo de Uso:**

```typescript
import { AuditoriaReportService } from '@services/reports';

constructor(private auditoriaReport: AuditoriaReportService) {}

relatorioLogs() {
  this.auditoriaReport.generateAuditoriaReport(this.logs, {
    dataInicio: new Date('2025-01-01'),
    dataFim: new Date('2025-01-31'),
    usuario: 'admin'
  });
}

acoesUsuario() {
  this.auditoriaReport.generateAcoesPorUsuarioReport({
    usuario: 'admin',
    periodo: 'Janeiro 2025',
    totalAcoes: 150,
    acoesPorTipo: [...],
    logs: [...]
  });
}
```

---

## Como Criar Novos Servicos de Relatorio

### 1. Criar novo arquivo

Exemplo: `medicamento-report.service.ts`

```typescript
import { Injectable } from "@angular/core";
import { PdfBuilderService } from "./pdf-builder.service";
import { ReportService } from "./report.service";

@Injectable({
  providedIn: "root",
})
export class MedicamentoReportService extends ReportService {
  constructor(protected override pdfBuilder: PdfBuilderService) {
    super(pdfBuilder);
  }

  generateEstoqueReport(medicamentos: any[]): void {
    this.generateListReport(
      "ESTOQUE DE MEDICAMENTOS",
      `Total: ${medicamentos.length} medicamentos`,
      [
        { header: "Codigo", field: "codigo", width: 30 },
        { header: "Nome", field: "nome", width: 80 },
        { header: "Quantidade", field: "quantidade", width: 30 },
        { header: "Validade", field: "validade", width: 30 },
      ],
      medicamentos,
      `estoque_medicamentos_${new Date().getTime()}.pdf`
    );
  }

  generateRelatorioConsumo(dados: any): void {
    // Implementar logica customizada
  }
}
```

### 2. Exportar no index.ts

```typescript
export * from "./medicamento-report.service";
```

### 3. Usar no componente

```typescript
import { MedicamentoReportService } from '@services/reports';

constructor(private medicamentoReport: MedicamentoReportService) {}
```

---

## Vantagens da Arquitetura Modular

1. **Reutilizacao:** Metodos utilitarios compartilhados
2. **Especializacao:** Cada servico focado em um dominio
3. **Manutencao:** Facil localizar e atualizar codigo
4. **Escalabilidade:** Adicionar novos relatorios sem afetar existentes
5. **Testabilidade:** Servicos injetaveis e testaveis isoladamente
6. **Consistencia:** Padronizacao visual em todos os relatorios
7. **Flexibilidade:** PdfBuilderService permite criacao de layouts customizados

---

## Padroes de Estilo

### Cores Padrao

- Azul: `[59, 130, 246]` - Cabecalhos, titulos
- Verde: `[34, 197, 94]` - Status positivo, ativo
- Laranja: `[251, 146, 60]` - Alertas, pendente
- Roxo: `[139, 92, 246]` - Secundario
- Vermelho: `[220, 38, 38]` - Alergias, erros
- Cinza: `[156, 163, 175]` - Inativo, finalizado

### Fontes

- Titulos: 14-18pt, bold
- Secoes: 12pt, bold
- Texto normal: 9-10pt, normal
- Notas: 8pt, italic

### Espacamento

- Margem esquerda/direita: 20mm
- Margem superior/inferior: 20mm
- Espaco entre secoes: 10mm
- Espaco entre linhas: 5mm

---

## Proximas Implementacoes

- [ ] SinaisVitaisReportService - Relatorios de sinais vitais
- [ ] FinanceiroReportService - Relatorios financeiros
- [ ] EstoqueReportService - Relatorios de estoque
- [ ] AlimentacaoReportService - Relatorios de alimentacao
- [ ] AgendamentoReportService - Relatorios de agendamentos
- [ ] Adicionar graficos com Chart.js
- [ ] Suporte a QR Codes
- [ ] Suporte a logos customizadas
- [ ] Templates de email com PDFs anexados

---

**Documentos Relacionados:**

- [Roadmap](../../../docs/desenvolvimento/roadmap.md)
- [Documentacao Tecnica](../../../docs/tecnica/)

<!--
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
-->
