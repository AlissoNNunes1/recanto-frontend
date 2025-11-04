import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IPAutorizado } from '../ip-autorizado';

@Component({
  selector: 'app-edit-ip-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  templateUrl: './edit-ip-dialog.component.html',
  styleUrls: ['./edit-ip-dialog.component.css'],
})
export class EditIpDialogComponent {
  ipForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditIpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPAutorizado
  ) {
    this.ipForm = this.fb.group({
      descricao: [
        data.descricao,
        [Validators.required, Validators.minLength(3)],
      ],
      ativo: [data.ativo],
    });
  }

  onSubmit(): void {
    if (this.ipForm.valid) {
      this.dialogRef.close(this.ipForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getDescricaoErrorMessage(): string {
    const descControl = this.ipForm.get('descricao');
    if (descControl?.hasError('required')) {
      return 'Descricao e obrigatoria';
    }
    if (descControl?.hasError('minlength')) {
      return 'Descricao deve ter no minimo 3 caracteres';
    }
    return '';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleString('pt-BR');
  }
}

// Dialog de edicao de IP autorizado
// Nao permite alterar o endereco IP, apenas descricao e status
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
