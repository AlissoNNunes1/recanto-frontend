import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ResidentsService } from '../residents/residents.service';
import {
  CreateEvolucaoDto,
  EvolucoesService,
  UpdateEvolucaoDto,
} from '../services/evolucoes.service';

@Component({
  selector: 'app-evolucoes-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './evolucoes-form.component.html',
  styleUrl: './evolucoes-form.component.css',
})
export class EvolucoesFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit = false;
  evolucaoId?: number;
  residentes: any[] = [];
  residenteId?: number;

  constructor(
    private fb: FormBuilder,
    private evolucoesService: EvolucoesService,
    private residentsService: ResidentsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.carregarResidentes();

    // Verificar se eh edicao ou criacao
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.evolucaoId = parseInt(id);
        this.carregarEvolucao();
      } else {
        // Verificar se há residenteId na query
        this.route.queryParamMap.subscribe((qParams) => {
          const resId = qParams.get('residenteId');
          if (resId) {
            this.residenteId = parseInt(resId);
            this.form.patchValue({ residenteId: this.residenteId });
          }
        });
      }
    });
  }

  createForm(): void {
    this.form = this.fb.group({
      residenteId: ['', Validators.required],
      descricaoEvolucao: ['', [Validators.required, Validators.minLength(10)]],
      objectivos: ['', Validators.maxLength(1000)],
      intervencoes: ['', Validators.maxLength(1000)],
      resultados: ['', Validators.maxLength(1000)],
      dataSeguimento: [''],
    });
  }

  carregarResidentes(): void {
    this.residentsService.getResidents().subscribe({
      next: (response: any) => {
        this.residentes = response.data || response || [];
      },
      error: (error) => {
        console.error('Erro ao carregar residentes:', error);
        this.snackBar.open('Erro ao carregar residentes', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  carregarEvolucao(): void {
    if (!this.evolucaoId) return;

    this.loading = true;
    this.evolucoesService.buscarPorId(this.evolucaoId).subscribe({
      next: (evolucao) => {
        this.form.patchValue({
          residenteId: evolucao.residenteId,
          descricaoEvolucao: evolucao.descricaoEvolucao,
          objectivos: evolucao.objectivos,
          intervencoes: evolucao.intervencoes,
          resultados: evolucao.resultados,
          dataSeguimento: evolucao.dataSeguimento
            ? new Date(evolucao.dataSeguimento)
            : null,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar evolucao:', error);
        this.snackBar.open('Erro ao carregar evolucao', 'Fechar', {
          duration: 3000,
        });
        this.router.navigate(['/evolucoes']);
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.snackBar.open(
        'Por favor, preencha todos os campos obrigatorios',
        'Fechar',
        {
          duration: 3000,
        }
      );
      return;
    }

    this.loading = true;

    if (this.isEdit && this.evolucaoId) {
      const dto: UpdateEvolucaoDto = this.form.value;
      this.evolucoesService.atualizar(this.evolucaoId, dto).subscribe({
        next: () => {
          this.snackBar.open('Evolucao atualizada com sucesso', 'Fechar', {
            duration: 3000,
          });
          this.router.navigate(['/evolucoes']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar evolucao:', error);
          this.snackBar.open('Erro ao atualizar evolucao', 'Fechar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
    } else {
      const dto: CreateEvolucaoDto = this.form.value;
      this.evolucoesService.criar(dto).subscribe({
        next: () => {
          this.snackBar.open('Evolucao criada com sucesso', 'Fechar', {
            duration: 3000,
          });
          this.router.navigate(['/evolucoes']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao criar evolucao:', error);
          this.snackBar.open('Erro ao criar evolucao', 'Fechar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/evolucoes']);
  }
}

// Componente de formulario para criar/editar evolucoes
// Valida entrada de dados e sincroniza com backend
// Suporta modo criacao e edicao
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
