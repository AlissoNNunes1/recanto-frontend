import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UsuarioCreate } from '../usuario';

@Component({
  selector: 'app-add-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './add-usuario-dialog.component.html',
  styleUrls: ['./add-usuario-dialog.component.css'],
})
export class AddUsuarioDialogComponent {
  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddUsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      cargo: ['funcionario', Validators.required],
      ativo: [true],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const usuarioData: UsuarioCreate = this.usuarioForm.value;
      this.dialogRef.close(usuarioData);
    }
  }
}

// Dialog para adicionar novo usuario ao sistema
// Validacao de campos obrigatorios e formato
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
