import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-add-ip-dialog',
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
  templateUrl: './add-ip-dialog.component.html',
  styleUrls: ['./add-ip-dialog.component.css'],
})
export class AddIpDialogComponent {
  ipForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddIpDialogComponent>
  ) {
    this.ipForm = this.fb.group({
      ip: [
        '',
        [
          Validators.required,
          Validators.pattern(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/),
        ],
      ],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      ativo: [true],
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

  getIPErrorMessage(): string {
    const ipControl = this.ipForm.get('ip');
    if (ipControl?.hasError('required')) {
      return 'IP e obrigatorio';
    }
    if (ipControl?.hasError('pattern')) {
      return 'IP invalido. Use formato XXX.XXX.XXX.XXX';
    }
    return '';
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
}

// Dialog de adicao de novo IP autorizado
// Validacao de formato IPv4 e campos obrigatorios
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
