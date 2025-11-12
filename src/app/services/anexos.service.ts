import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Configuracao da API
const API_URL = 'http://localhost:3000/api/v1';

export enum TipoAnexo {
  PDF = 'PDF',
  IMAGEM = 'IMAGEM',
  DOCUMENTO = 'DOCUMENTO',
  LAUDO = 'LAUDO',
  RESULTADO = 'RESULTADO',
  OUTROS = 'OUTROS',
}

export interface Anexo {
  id: number;
  consultaId?: number;
  exameId?: number;
  usuarioUploadId: number;
  usuarioNome: string;
  nomeArquivo: string;
  nomeArquivoStorage: string;
  caminhoArquivo: string;
  tipoMime: string;
  tamanhoBytes: number;
  tamanhoFormatado: string;
  tipoAnexo: TipoAnexo;
  descricao?: string;
  urlDownload: string;
  urlPreview: string;
  createdAt: Date;
}

export interface UploadProgress {
  progress: number;
  arquivo: string;
  status: 'uploading' | 'completed' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class AnexosService {
  private apiUrl = `${API_URL}/anexos`;

  constructor(private http: HttpClient) {}

  /**
   * Upload de arquivo para consulta com progresso
   */
  uploadParaConsulta(
    consultaId: number,
    arquivo: File,
    tipoAnexo: TipoAnexo,
    descricao?: string
  ): Observable<UploadProgress | Anexo> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('tipoAnexo', tipoAnexo);
    if (descricao) {
      formData.append('descricao', descricao);
    }

    return this.http
      .post<Anexo>(`${this.apiUrl}/consulta/${consultaId}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(map((event) => this.getEventMessage(event, arquivo)));
  }

  /**
   * Upload de arquivo para exame com progresso
   */
  uploadParaExame(
    exameId: number,
    arquivo: File,
    tipoAnexo: TipoAnexo,
    descricao?: string
  ): Observable<UploadProgress | Anexo> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('tipoAnexo', tipoAnexo);
    if (descricao) {
      formData.append('descricao', descricao);
    }

    return this.http
      .post<Anexo>(`${this.apiUrl}/exame/${exameId}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(map((event) => this.getEventMessage(event, arquivo)));
  }

  /**
   * Listar anexos de uma consulta
   */
  listarPorConsulta(consultaId: number): Observable<Anexo[]> {
    return this.http.get<Anexo[]>(`${this.apiUrl}/consulta/${consultaId}`);
  }

  /**
   * Listar anexos de um exame
   */
  listarPorExame(exameId: number): Observable<Anexo[]> {
    return this.http.get<Anexo[]>(`${this.apiUrl}/exame/${exameId}`);
  }

  /**
   * Obter URL de download
   */
  getUrlDownload(anexoId: number): string {
    return `${this.apiUrl}/${anexoId}/download`;
  }

  /**
   * Obter URL de preview
   */
  getUrlPreview(anexoId: number): string {
    return `${this.apiUrl}/${anexoId}/preview`;
  }

  /**
   * Obter preview como Blob (passa pelo interceptor com token)
   */
  getPreviewBlob(anexoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${anexoId}/preview`, {
      responseType: 'blob',
    });
  }

  /**
   * Excluir anexo
   */
  excluir(anexoId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${anexoId}`);
  }

  /**
   * Verificar se arquivo e imagem
   */
  isImagem(anexo: Anexo): boolean {
    return (
      anexo.tipoMime.startsWith('image/') ||
      anexo.tipoAnexo === TipoAnexo.IMAGEM
    );
  }

  /**
   * Verificar se arquivo e PDF
   */
  isPDF(anexo: Anexo): boolean {
    return (
      anexo.tipoMime === 'application/pdf' || anexo.tipoAnexo === TipoAnexo.PDF
    );
  }

  /**
   * Obter icone do Material Icons baseado no tipo
   */
  getIcone(anexo: Anexo): string {
    if (this.isImagem(anexo)) return 'image';
    if (this.isPDF(anexo)) return 'picture_as_pdf';
    return 'description';
  }

  /**
   * Obter cor do tipo de anexo
   */
  getCor(tipoAnexo: TipoAnexo): string {
    const cores: Record<TipoAnexo, string> = {
      [TipoAnexo.PDF]: 'warn',
      [TipoAnexo.IMAGEM]: 'primary',
      [TipoAnexo.DOCUMENTO]: 'accent',
      [TipoAnexo.LAUDO]: 'warn',
      [TipoAnexo.RESULTADO]: 'primary',
      [TipoAnexo.OUTROS]: 'basic',
    };
    return cores[tipoAnexo] || 'basic';
  }

  /**
   * Processar eventos de upload para progresso
   */
  private getEventMessage(
    event: HttpEvent<any>,
    arquivo: File
  ): UploadProgress | Anexo {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        const percentDone = event.total
          ? Math.round((100 * event.loaded) / event.total)
          : 0;
        return {
          progress: percentDone,
          arquivo: arquivo.name,
          status: 'uploading',
        };

      case HttpEventType.Response:
        return event.body as Anexo;

      default:
        return {
          progress: 0,
          arquivo: arquivo.name,
          status: 'uploading',
        };
    }
  }

  /**
   * Validar arquivo antes de upload
   */
  validarArquivo(arquivo: File): { valido: boolean; erro?: string } {
    // Tamanho maximo 10MB
    const maxSize = 10 * 1024 * 1024;
    if (arquivo.size > maxSize) {
      return {
        valido: false,
        erro: 'Arquivo muito grande. Tamanho maximo: 10MB',
      };
    }

    // Tipos permitidos
    const tiposPermitidos = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      return {
        valido: false,
        erro: 'Tipo de arquivo nao permitido. Use: PDF, PNG, JPG, DOC ou DOCX',
      };
    }

    return { valido: true };
  }
}

// Service de anexos para consultas e exames
// Upload com progresso, download, preview e exclusao
// Validacao de tamanho e tipo de arquivo
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
