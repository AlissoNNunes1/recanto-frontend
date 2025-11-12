import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
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
export class AnexosPreviewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tipo: 'consulta' | 'exame' = 'consulta';
  @Input() registroId!: number;
  @Input() anexos: Anexo[] = [];
  @Input() autoCarregar = true;

  carregando = false;
  previewUrls: Map<number, SafeResourceUrl> = new Map();
  // Cache separado para URLs brutas (usadas em window.open)
  private blobUrls: Map<number, string> = new Map();

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
        // Carregar previews de imagens apenas se houver anexos
        if (this.anexos.length > 0) {
          this.carregarPreviewsDeImagens();
        }
      },
      error: (erro) => {
        console.error('Erro ao carregar anexos:', erro);
        this.anexos = []; // Garantir array vazio em caso de erro
        this.snackBar.open('Erro ao carregar anexos', 'Fechar', {
          duration: 3000,
        });
        this.carregando = false;
      },
    });
  }

  /**
   * Carregar previews de imagens via HttpClient (passa pelo interceptor)
   */
  private carregarPreviewsDeImagens(): void {
    this.anexos
      .filter((anexo) => this.isImagem(anexo))
      .forEach((anexo) => {
        this.anexosService.getPreviewBlob(anexo.id).subscribe({
          next: (blob) => {
            const url = URL.createObjectURL(blob);
            // Armazenar URL bruta para window.open
            this.blobUrls.set(anexo.id, url);
            // Armazenar SafeResourceUrl para template
            this.previewUrls.set(
              anexo.id,
              this.sanitizer.bypassSecurityTrustResourceUrl(url)
            );
          },
          error: (erro) => {
            console.error(
              `Erro ao carregar preview do anexo ${anexo.id}:`,
              erro
            );
          },
        });
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
  getUrlPreviewSegura(anexo: Anexo): SafeResourceUrl | string {
    // Se ja carregou o preview como Blob, retorna da cache
    if (this.previewUrls.has(anexo.id)) {
      return this.previewUrls.get(anexo.id)!;
    }
    // Caso contrario, retorna placeholder ou vazio
    return '';
  }

  /**
   * Download de anexo
   */
  downloadAnexo(anexo: Anexo): void {
    this.anexosService.getPreviewBlob(anexo.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = anexo.nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      error: (erro) => {
        console.error('Erro ao baixar anexo:', erro);
        this.snackBar.open('Erro ao baixar arquivo', 'Fechar', {
          duration: 3000,
        });
      },
    });
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
    // Buscar URL bruta do cache ou carregar
    if (this.blobUrls.has(anexo.id)) {
      // Abrir em nova aba usando Blob URL do cache
      const url = this.blobUrls.get(anexo.id);
      window.open(url, '_blank');
    } else {
      // Carregar via HttpClient (passa pelo interceptor com token)
      this.anexosService.getPreviewBlob(anexo.id).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          // Armazenar no cache para proximas visualizacoes
          this.blobUrls.set(anexo.id, url);
          this.previewUrls.set(
            anexo.id,
            this.sanitizer.bypassSecurityTrustResourceUrl(url)
          );
        },
        error: (erro) => {
          console.error('Erro ao abrir preview:', erro);
          this.snackBar.open('Erro ao visualizar arquivo', 'Fechar', {
            duration: 3000,
          });
        },
      });
    }
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

  /**
   * Limpeza ao destruir componente
   */
  ngOnDestroy(): void {
    // Liberar URLs de Blob da memoria
    this.blobUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.blobUrls.clear();
    this.previewUrls.clear();
  }
}

// Componente de preview de anexos
// Galeria com thumbnails, download e exclusao
// Suporta imagens e PDFs
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
