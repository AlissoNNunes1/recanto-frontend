import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warn' | 'primary' | 'accent';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon [color]="data.type || 'primary'">
        {{ data.type === 'warn' ? 'warning' : 'help_outline' }}
      </mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || 'Cancelar' }}
      </button>
      <button
        mat-raised-button
        [color]="data.type || 'primary'"
        (click)="onConfirm()"
      >
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      mat-dialog-content {
        padding: 20px 0;
        min-width: 300px;
      }

      mat-dialog-actions {
        padding: 12px 0 0 0;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

/*
   __  ____ ____ _  _
 / _\/ ___) ___) )( \
/    \___ \___ ) \/ (
\_/\_(____(____|____/
*/
