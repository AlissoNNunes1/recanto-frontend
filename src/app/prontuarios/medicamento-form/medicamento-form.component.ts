import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicamentoCreate, ProntuarioEletronico } from '../prontuario';
import { ProntuariosService } from '../prontuarios.service';
import { AllergyWarningDialogComponent } from '../allergy-warning-dialog/allergy-warning-dialog.component';

@Component({
  selector: 'app-medicamento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './medicamento-form.component.html',
  styleUrls: ['./medicamento-form.component.css'],
})
export class MedicamentoFormComponent implements OnInit {
  medicamentoForm!: FormGroup;
  prontuarioId!: number;
  prontuario: ProntuarioEletronico | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prontuariosService: ProntuariosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('prontuarioId');
    if (id) {
      this.prontuarioId = Number(id);
      this.loadProntuario();
    } else {
      this.showError('ID do prontuario nao encontrado');
      this.goBack();
      return;
    }

    this.initForm();
  }

  loadProntuario(): void {
    this.prontuariosService.getProntuario(this.prontuarioId).subscribe({
      next: (prontuario) => {
        this.prontuario = prontuario;
      },
      error: (error) => {
        console.error('Erro ao carregar prontuario:', error);
      }
    });
  }

  initForm(): void {
    this.medicamentoForm = this.fb.group({
      profissionalId: [null, Validators.required],
      medicamentoNome: ['', Validators.required],
      dosagem: ['', Validators.required],
      viaAdministracao: ['', Validators.required],
      frequenciaAdministracao: ['', Validators.required],
      indicacaoClinica: ['', Validators.required],
      instrucoesUso: [''],
      dataInicio: [new Date(), Validators.required],
      dataFim: [null],
      quantidade: [''],
      observacoes: [''],
    });
  }

  onSubmit(): void {
    if (this.medicamentoForm.invalid) {
      this.markFormGroupTouched(this.medicamentoForm);
      this.showError('Por favor, preencha todos os campos obrigatorios');
      return;
    }

    const medicamentoNome = this.medicamentoForm.get('medicamentoNome')?.value;
    
    // Verificar alergias antes de submeter
    if (this.prontuario?.alergias && this.prontuario.alergias.length > 0) {
      const alergiaDetectada = this.checkAllergies(medicamentoNome);
      
      if (alergiaDetectada.length > 0) {
        this.showAllergyWarning(medicamentoNome, alergiaDetectada);
        return;
      }
    }

    this.submitMedicamento();
  }

  checkAllergies(medicamentoNome: string): string[] {
    if (!this.prontuario?.alergias) return [];
    
    const medicamentoLower = medicamentoNome.toLowerCase();
    const alergiasFiltradas: string[] = [];

    for (const alergia of this.prontuario.alergias) {
      const alergiaLower = alergia.toLowerCase();
      
      // Verificar se alguma palavra da alergia esta no nome do medicamento
      const palavrasAlergia = alergiaLower.split(/[\s,;]+/);
      const palavrasMedicamento = medicamentoLower.split(/[\s,;]+/);
      
      for (const palavraAlergia of palavrasAlergia) {
        if (palavraAlergia.length > 3) { // Ignorar palavras muito curtas
          for (const palavraMed of palavrasMedicamento) {
            if (palavraMed.includes(palavraAlergia) || palavraAlergia.includes(palavraMed)) {
              alergiasFiltradas.push(alergia);
              break;
            }
          }
        }
      }
    }

    return alergiasFiltradas;
  }

  showAllergyWarning(medicamentoNome: string, alergias: string[]): void {
    const dialogRef = this.dialog.open(AllergyWarningDialogComponent, {
      width: '500px',
      data: {
        medicamentoNome,
        alergias
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.submitMedicamento();
      }
    });
  }

  submitMedicamento(): void {
    this.loading = true;

    const medicamentoData: MedicamentoCreate = {
      prontuarioId: this.prontuarioId,
      ...this.medicamentoForm.value,
    };

    this.prontuariosService.createMedicamento(this.prontuarioId, medicamentoData).subscribe({
      next: () => {
        this.showSuccess('Medicamento prescrito com sucesso');
        this.goBack();
      },
      error: (error) => {
        console.error('Erro ao prescrever medicamento:', error);
        this.showError(error.error?.message || 'Erro ao prescrever medicamento');
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/prontuario-detail', this.prontuarioId]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.medicamentoForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Campo obrigatorio';
    }
    return '';
  }
}

// Formulario para prescricao de medicamentos
// Permite adicionar nova prescricao a um prontuario
// Validacoes de campos obrigatorios e feedback visual
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
