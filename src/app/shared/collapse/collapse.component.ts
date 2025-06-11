import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

/**
 * Componente de collapse personalizado mobile-first para substituir MDB
 * Implementa acessibilidade completa e responsividade
 */
@Component({
  selector: 'app-collapse',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="collapse-container"
      [class.collapsed]="!isOpen"
      [class.expanded]="isOpen"
      [@collapseAnimation]="isOpen ? 'expanded' : 'collapsed'"
      [attr.aria-expanded]="isOpen"
      [attr.aria-hidden]="!isOpen"
      role="region"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .collapse-container {
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: height, opacity;
      }

      .collapse-container.collapsed {
        opacity: 0;
        height: 0;
        margin: 0;
        padding: 0;
      }

      .collapse-container.expanded {
        opacity: 1;
        height: auto;
      }

      /* Suporte para modo escuro */
      @media (prefers-color-scheme: dark) {
        .collapse-container {
          color: #ffffff;
        }
      }

      /* Melhorias de acessibilidade para foco */
      .collapse-container:focus-within {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }

      /* Responsividade mobile-first */
      @media (max-width: 576px) {
        .collapse-container.expanded {
          width: 100%;
        }
      }
    `,
  ],
  animations: [
    trigger('collapseAnimation', [
      state(
        'collapsed',
        style({
          height: '0px',
          opacity: 0,
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
          overflow: 'visible',
        })
      ),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
  ],
})
export class CollapseComponent {
  @Input() isOpen: boolean = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() toggleCollapse = new EventEmitter<boolean>();

  /**
   * Alterna o estado do collapse
   */
  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
    this.toggleCollapse.emit(this.isOpen);
  }

  /**
   * Abre o collapse
   */
  open(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.isOpenChange.emit(this.isOpen);
      this.toggleCollapse.emit(this.isOpen);
    }
  }

  /**
   * Fecha o collapse
   */
  close(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.isOpenChange.emit(this.isOpen);
      this.toggleCollapse.emit(this.isOpen);
    }
  }

  /**
   * Suporte para navegação por teclado
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }

    if (event.key === 'Escape' && this.isOpen) {
      event.preventDefault();
      this.close();
    }
  }
}

// Componente Collapse Personalizado - RECANTO Mobile-First
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
