import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AllergyWarningData {
  medicamentoNome: string;
  alergias: string[];
}

@Component({
  selector: 'app-allergy-warning-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="allergy-dialog">
      <h2 mat-dialog-title class="warning-title">
        <mat-icon color="warn">warning</mat-icon>
        ALERTA DE ALERGIA
      </h2>
      <mat-dialog-content>
        <div class="warning-content">
          <p class="medication-name">
            <strong>Medicamento:</strong> {{ data.medicamentoNome }}
          </p>
          <p class="alert-message">
            O paciente possui alergia(s) registrada(s) que podem estar relacionadas:
          </p>
          <ul class="allergy-list">
            <li *ngFor="let alergia of data.alergias">{{ alergia }}</li>
          </ul>
          <p class="confirmation-message">
            Deseja continuar com a prescricao mesmo assim?
          </p>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          <mat-icon>check_circle</mat-icon>
          Confirmar Prescricao
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .allergy-dialog {
      max-width: 500px;
    }

    .warning-title {
      color: #f44336;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      margin: 0;
    }

    .warning-content {
      padding: 20px 0;
    }

    .medication-name {
      font-size: 16px;
      margin-bottom: 15px;
      padding: 10px;
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
    }

    .alert-message {
      font-weight: 500;
      margin-bottom: 10px;
      color: #d32f2f;
    }

    .allergy-list {
      background-color: #ffebee;
      padding: 15px 15px 15px 35px;
      border-radius: 4px;
      margin: 15px 0;
    }

    .allergy-list li {
      margin: 8px 0;
      font-size: 15px;
      color: #c62828;
      font-weight: 500;
    }

    .confirmation-message {
      font-weight: 500;
      margin-top: 20px;
      padding: 10px;
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
    }

    mat-dialog-actions {
      padding: 15px 0 0 0;
      margin: 0;
    }

    button {
      margin-left: 10px;
    }
  `]
})
export class AllergyWarningDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AllergyWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AllergyWarningData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

// Componente de dialogo para alertas de alergia
// Exibe aviso quando medicamento pode estar relacionado a alergias do paciente
// Permite confirmacao ou cancelamento da prescricao
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
