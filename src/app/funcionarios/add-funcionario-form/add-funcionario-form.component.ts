import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { FuncionariosService } from '../funcionarios.service'; // Ajuste o caminho conforme necessário
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-funcionario-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule], // Adicione os módulos necessários aqui
  templateUrl: './add-funcionario-form.component.html',
  styleUrls: ['./add-funcionario-form.component.css']
})
export class AddFuncionarioFormComponent {
  funcionarioForm: FormGroup;

  constructor(private fb: FormBuilder, private funcionariosService: FuncionariosService) {
    this.funcionarioForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      funcao: ['', Validators.required],
      turno: ['', Validators.required],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      UsuarioId: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.funcionarioForm.valid) {
      this.funcionariosService.createFuncionario(this.funcionarioForm.value).subscribe({
        next: (res) => console.log('Funcionário adicionado com sucesso!', res),
        error: (err) => console.error('Erro ao adicionar funcionário:', err)
      });
    }
  }
}
