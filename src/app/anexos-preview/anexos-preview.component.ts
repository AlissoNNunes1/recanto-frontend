import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Anexo, AnexosService } from '../services/anexos.service';

@Component({
  selector: 'app-anexos-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './anexos-preview.component.html',
  styleUrls: ['./anexos-preview.component.css'],
})
export class AnexosPreviewComponent implements OnInit, OnChanges {
  @Input() tipo: 'consulta' | 'exame' = 'consulta';
  @Input() registroId!: number;
  @Input() anexos: Anexo[] = [];
  @Input() autoCarregar = true;

  carregando = false;

  constructor(
    private anexosService: AnexosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.autoCarregar && this.registroId) {
      this.carregarAnexos();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registroId'] && !changes['registroId'].firstChange) {
      if (this.autoCarregar && this.registroId) {
        this.carregarAnexos();
      }
    }
  }

  /**
   * Carregar lista de anexos
   */
  carregarAnexos(): void {
    this.carregando = true;

    const request$ =
      this.tipo === 'consulta'
        ? this.anexosService.listarPorConsulta(this.registroId)
        : this.anexosService.listarPorExame(this.registroId);

    request$.subscribe({
      next: (anexos) => {
        this.anexos = anexos;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar anexos:', erro);
        this.snackBar.open('Erro ao carregar anexos', 'Fechar', {
          duration: 3000,
        });
        this.carregando = false;
      },
    });
  }

  /**
   * Verificar se anexo e imagem
   */
  isImagem(anexo: Anexo): boolean {
    return this.anexosService.isImagem(anexo);
  }

  /**
   * Verificar se anexo e PDF
   */
  isPDF(anexo: Anexo): boolean {
    return this.anexosService.isPDF(anexo);
  }

  /**
   * Obter icone do anexo
   */
  getIcone(anexo: Anexo): string {
    return this.anexosService.getIcone(anexo);
  }

  /**
   * Obter cor do chip
   */
  getCor(anexo: Anexo): string {
    return this.anexosService.getCor(anexo.tipoAnexo);
  }

  /**
   * Obter URL de preview segura
   */
  getUrlPreviewSegura(anexo: Anexo): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.anexosService.getUrlPreview(anexo.id)
    );
  }

  /**
   * Download de anexo
   */
  downloadAnexo(anexo: Anexo): void {
    window.open(this.anexosService.getUrlDownload(anexo.id), '_blank');
  }

  /**
   * Excluir anexo com confirmacao
   */
  excluirAnexo(anexo: Anexo): void {
    const confirma = confirm(
      `Deseja realmente excluir o arquivo "${anexo.nomeArquivo}"?`
    );

    if (!confirma) return;

    this.anexosService.excluir(anexo.id).subscribe({
      next: () => {
        this.snackBar.open('Anexo excluido com sucesso', 'Fechar', {
          duration: 3000,
        });
        this.anexos = this.anexos.filter((a) => a.id !== anexo.id);
      },
      error: (erro) => {
        console.error('Erro ao excluir anexo:', erro);
        this.snackBar.open('Erro ao excluir anexo', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  /**
   * Abrir preview em modal
   */
  abrirPreviewModal(anexo: Anexo): void {
    // TODO: Implementar dialog com preview fullscreen
    // Por enquanto, abrir em nova aba
    window.open(this.anexosService.getUrlPreview(anexo.id), '_blank');
  }

  /**
   * Formatacao de data
   */
  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Componente de preview de anexos
// Galeria com thumbnails, download e exclusao
// Suporta imagens e PDFs
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
