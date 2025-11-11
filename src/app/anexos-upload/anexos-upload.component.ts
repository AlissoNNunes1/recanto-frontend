import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Anexo,
  AnexosService,
  TipoAnexo,
  UploadProgress,
} from '../services/anexos.service';

@Component({
  selector: 'app-anexos-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './anexos-upload.component.html',
  styleUrls: ['./anexos-upload.component.css'],
})
export class AnexosUploadComponent implements OnInit {
  @Input() tipo: 'consulta' | 'exame' = 'consulta';
  @Input() registroId!: number;
  @Output() uploadCompleto = new EventEmitter<Anexo>();
  @Output() uploadErro = new EventEmitter<string>();

  tipoAnexo: TipoAnexo = TipoAnexo.OUTROS;
  descricao = '';
  arquivosSelecionados: File[] = [];
  uploadsEmProgresso: Map<string, UploadProgress> = new Map();
  dragOver = false;

  tiposAnexo = [
    { valor: TipoAnexo.PDF, label: 'PDF' },
    { valor: TipoAnexo.IMAGEM, label: 'Imagem' },
    { valor: TipoAnexo.DOCUMENTO, label: 'Documento' },
    { valor: TipoAnexo.LAUDO, label: 'Laudo Medico' },
    { valor: TipoAnexo.RESULTADO, label: 'Resultado de Exame' },
    { valor: TipoAnexo.OUTROS, label: 'Outros' },
  ];

  constructor(private anexosService: AnexosService) {}

  ngOnInit(): void {
    if (!this.registroId) {
      console.error('registroId e obrigatorio para AnexosUploadComponent');
    }
  }

  /**
   * Evento de selecao de arquivo via input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.adicionarArquivos(Array.from(input.files));
    }
  }

  /**
   * Drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  /**
   * Drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  /**
   * Drop de arquivo
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    if (event.dataTransfer?.files) {
      this.adicionarArquivos(Array.from(event.dataTransfer.files));
    }
  }

  /**
   * Adicionar arquivos a lista
   */
  private adicionarArquivos(arquivos: File[]): void {
    for (const arquivo of arquivos) {
      const validacao = this.anexosService.validarArquivo(arquivo);
      if (!validacao.valido) {
        this.uploadErro.emit(`${arquivo.name}: ${validacao.erro}`);
        continue;
      }

      // Evitar duplicados
      if (!this.arquivosSelecionados.some((f) => f.name === arquivo.name)) {
        this.arquivosSelecionados.push(arquivo);
      }
    }
  }

  /**
   * Remover arquivo da lista
   */
  removerArquivo(index: number): void {
    this.arquivosSelecionados.splice(index, 1);
  }

  /**
   * Fazer upload de todos arquivos
   */
  fazerUpload(): void {
    if (this.arquivosSelecionados.length === 0) {
      this.uploadErro.emit('Nenhum arquivo selecionado');
      return;
    }

    for (const arquivo of this.arquivosSelecionados) {
      this.uploadArquivo(arquivo);
    }
  }

  /**
   * Upload de arquivo individual
   */
  private uploadArquivo(arquivo: File): void {
    const upload$ =
      this.tipo === 'consulta'
        ? this.anexosService.uploadParaConsulta(
            this.registroId,
            arquivo,
            this.tipoAnexo,
            this.descricao
          )
        : this.anexosService.uploadParaExame(
            this.registroId,
            arquivo,
            this.tipoAnexo,
            this.descricao
          );

    upload$.subscribe({
      next: (resultado) => {
        if ('progress' in resultado) {
          // Atualizar progresso
          this.uploadsEmProgresso.set(arquivo.name, resultado);
        } else {
          // Upload completo
          this.uploadsEmProgresso.delete(arquivo.name);
          this.arquivosSelecionados = this.arquivosSelecionados.filter(
            (f) => f.name !== arquivo.name
          );
          this.uploadCompleto.emit(resultado);
        }
      },
      error: (erro) => {
        this.uploadsEmProgresso.delete(arquivo.name);
        this.uploadErro.emit(
          `Erro ao enviar ${arquivo.name}: ${
            erro.error?.message || 'Erro desconhecido'
          }`
        );
      },
    });
  }

  /**
   * Limpar formulario
   */
  limpar(): void {
    this.arquivosSelecionados = [];
    this.uploadsEmProgresso.clear();
    this.descricao = '';
    this.tipoAnexo = TipoAnexo.OUTROS;
  }

  /**
   * Obter tamanho formatado
   */
  getTamanhoFormatado(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + tamanhos[i];
  }

  /**
   * Obter progresso de upload
   */
  getProgresso(nomeArquivo: string): number {
    return this.uploadsEmProgresso.get(nomeArquivo)?.progress || 0;
  }

  /**
   * Verificar se ha uploads em progresso
   */
  temUploadsEmProgresso(): boolean {
    return this.uploadsEmProgresso.size > 0;
  }
}

// Componente de upload de anexos
// Suporta drag and drop e selecao multipla
// Barra de progresso para cada arquivo
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
