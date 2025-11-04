import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Usuario, UsuarioUpdate } from '../usuario';

@Component({
  selector: 'app-edit-usuario-dialog',
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
  templateUrl: './edit-usuario-dialog.component.html',
  styleUrls: ['./edit-usuario-dialog.component.css'],
})
export class EditUsuarioDialogComponent implements OnInit {
  usuarioForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditUsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario
  ) {
    this.usuarioForm = this.fb.group({
      nome: [data.nome, [Validators.required, Validators.minLength(3)]],
      email: [data.email, [Validators.required, Validators.email]],
      senha: [''], // Senha opcional na edicao
      cargo: [data.cargo, Validators.required],
      ativo: [data.ativo],
    });
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      const usuarioData: UsuarioUpdate = this.usuarioForm.value;
      // Remove senha se estiver vazia
      if (!usuarioData.senha || usuarioData.senha.trim() === '') {
        delete usuarioData.senha;
      }
      this.dialogRef.close(usuarioData);
    }
  }
}

// Dialog para editar usuario existente
// Senha e opcional (apenas se desejar alterar)
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
