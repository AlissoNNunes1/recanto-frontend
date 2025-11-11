import { Injectable } from '@angular/core';

/**
 * Servico para geracao de fingerprint unico do dispositivo/navegador
 * Usado para autenticacao automatica independente do IP
 * Suporta IPs dinamicos mantendo o mesmo dispositivo autorizado
 */
@Injectable({
  providedIn: 'root',
})
export class FingerprintService {
  private readonly STORAGE_KEY = 'device_fingerprint';
  private fingerprint: string | null = null;

  constructor() {
    this.initializeFingerprint();
  }

  /**
   * Inicializa ou recupera fingerprint do dispositivo
   */
  private initializeFingerprint(): void {
    // Tentar recuperar fingerprint do localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (stored) {
      this.fingerprint = stored;
      console.log('Fingerprint recuperado do storage');
    } else {
      // Gerar novo fingerprint se nao existir
      this.fingerprint = this.generateFingerprint();
      localStorage.setItem(this.STORAGE_KEY, this.fingerprint);
      console.log('Novo fingerprint gerado');
    }
  }

  /**
   * Gera fingerprint unico baseado em caracteristicas do navegador
   * Combina multiplos fatores para criar identificador estavel
   */
  private generateFingerprint(): string {
    const components: string[] = [];

    // 1. User Agent
    components.push(navigator.userAgent);

    // 2. Idioma
    components.push(navigator.language);

    // 3. Resolucao da tela
    components.push(`${screen.width}x${screen.height}`);

    // 4. Profundidade de cor
    components.push(String(screen.colorDepth));

    // 5. Timezone offset
    components.push(String(new Date().getTimezoneOffset()));

    // 6. Plataforma
    components.push(navigator.platform);

    // 7. Cookies habilitados
    components.push(String(navigator.cookieEnabled));

    // 8. Plugins (se disponivel)
    if (navigator.plugins) {
      const pluginsList = Array.from(navigator.plugins)
        .map((p) => p.name)
        .sort()
        .join(',');
      components.push(pluginsList);
    }

    // 9. Canvas fingerprint (simples)
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Recanto', 2, 2);
        const canvasData = canvas.toDataURL();
        components.push(canvasData);
      }
    } catch (e) {
      console.warn('Canvas fingerprint nao disponivel');
    }

    // 10. WebGL fingerprint (se disponivel)
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          components.push(`${vendor}|${renderer}`);
        }
      }
    } catch (e) {
      console.warn('WebGL fingerprint nao disponivel');
    }

    // 11. Timestamp de criacao + random para unicidade
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    components.push(`${timestamp}_${random}`);

    // Gerar hash do fingerprint
    const fingerprintString = components.join('|');
    return this.simpleHash(fingerprintString);
  }

  /**
   * Gera hash simples de uma string
   * Usado para criar fingerprint compacto
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Converter para formato hexadecimal com prefixo
    const hashHex = Math.abs(hash).toString(36);
    const timestamp = Date.now().toString(36);
    return `fp_${hashHex}_${timestamp}`;
  }

  /**
   * Retorna o fingerprint atual do dispositivo
   */
  getFingerprint(): string {
    if (!this.fingerprint) {
      this.initializeFingerprint();
    }
    return this.fingerprint || '';
  }

  /**
   * Regenera fingerprint (usar apenas se necessario)
   * Remove o fingerprint antigo e cria um novo
   */
  regenerateFingerprint(): string {
    localStorage.removeItem(this.STORAGE_KEY);
    this.fingerprint = this.generateFingerprint();
    localStorage.setItem(this.STORAGE_KEY, this.fingerprint);
    console.log('Fingerprint regenerado');
    return this.fingerprint;
  }

  /**
   * Limpa fingerprint armazenado
   * Usado para logout completo ou reset
   */
  clearFingerprint(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.fingerprint = null;
    console.log('Fingerprint removido');
  }

  /**
   * Verifica se dispositivo tem fingerprint valido
   */
  hasValidFingerprint(): boolean {
    return !!this.getFingerprint();
  }

  /**
   * Obtem informacoes de debug do fingerprint
   */
  getDebugInfo(): any {
    return {
      fingerprint: this.getFingerprint(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: new Date().getTimezoneOffset(),
      cookiesEnabled: navigator.cookieEnabled,
      stored: !!localStorage.getItem(this.STORAGE_KEY),
    };
  }
}

// Servico de geracao de fingerprint de dispositivo
// Cria identificador unico e estavel independente do IP
// Suporta autenticacao automatica com IPs dinamicos
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
