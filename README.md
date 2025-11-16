# Recanto Frontend

Sistema de gestao para asilos desenvolvido com [Angular CLI](https://github.com/angular/angular-cli) version 18.0.4.

## Servidor de Desenvolvimento

Execute `ng serve` para iniciar o servidor de desenvolvimento. Acesse `http://localhost:4200/`. A aplicacao sera recarregada automaticamente ao modificar arquivos.

## Estrutura do Projeto

```
src/app/
├── auth/                 # Autenticacao e autorizacao
├── funcionarios/         # Gestao de funcionarios
├── prontuarios/          # Prontuarios eletronicos
├── residents/            # Gestao de residentes
├── services/             # Servicos compartilhados
│   └── reports/          # Sistema de relatorios PDF
│       ├── pdf-builder.service.ts
│       ├── report.service.ts
│       ├── prontuario-report.service.ts
│       ├── residente-report.service.ts
│       ├── funcionario-report.service.ts
│       └── auditoria-report.service.ts
├── shared/               # Componentes compartilhados
└── header/               # Navegacao principal
```

## Sistema de Relatorios

O projeto implementa um sistema modular de geracao de relatorios PDF reutilizavel em todos os modulos.

### Servicos Disponiveis

- **PdfBuilderService**: Utilitarios de baixo nivel para construcao de PDFs
- **ReportService**: Templates genericos (lista, detalhe, analytics)
- **ProntuarioReportService**: Relatorios de prontuarios eletronicos
- **ResidenteReportService**: Relatorios de residentes
- **FuncionarioReportService**: Relatorios de funcionarios
- **AuditoriaReportService**: Relatorios de auditoria

### Exemplo de Uso

```typescript
import { ResidenteReportService } from '@services/reports';

constructor(private residenteReport: ResidenteReportService) {}

gerarRelatorio() {
  this.residenteReport.generateResidentesListReport(this.residentes);
}
```

Consulte `src/app/services/reports/README.md` para documentacao completa.

## Principais Funcionalidades

- **Autenticacao**: Login com JWT e validacao de dispositivo
- **Prontuarios Eletronicos**: Gestao completa com consultas, exames, medicamentos e anexos
- **Gestao de Residentes**: Cadastro, historico e acompanhamento
- **Gestao de Funcionarios**: Cadastro, escalas e turnos
- **Sistema de Anexos**: Upload e gerenciamento de arquivos
- **Relatorios PDF**: Geracao automatica de relatorios em todos os modulos
- **Auditoria**: Registro completo de acoes no sistema

## Comandos Uteis

### Gerar Componentes

```bash
ng generate component component-name
ng generate service service-name
ng generate module module-name
```

### Build

```bash
ng build                    # Build de desenvolvimento
ng build --configuration production  # Build de producao
```

### Testes

```bash
ng test                     # Testes unitarios
ng e2e                      # Testes end-to-end
```

## Tecnologias Utilizadas

- Angular 18
- Angular Material
- jsPDF (geracao de PDFs)
- RxJS
- TypeScript

## Documentacao

- **Frontend**: Este README
- **Backend**: `../recanto_backend/README.md`
- **Documentacao Completa**: `../docs/`
- **Mudancas Recentes**: `../MUDANCAS-PRONTUARIO.md`

## Padroes de Desenvolvimento

- Comentarios em portugues brasileiro SEM acentos
- Mobile-first e responsivo
- Modular e reutilizavel
- Seguir principios SOLID

Consulte `.github/copilot-instructions.md` para diretrizes completas.

<!--
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
-->
