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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ResidentsService } from '../residents/residents.service';
import { SinaisVitaisService } from '../services/sinais-vitais.service';

@Component({
  selector: 'app-sinais-vitais-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './sinais-vitais-form.component.html',
  styleUrl: './sinais-vitais-form.component.css',
})
export class SinaisVitaisFormComponent implements OnInit {
  form!: FormGroup;
  residentes: any[] = [];
  loading = false;
  isEditMode = false;
  sinalVitalId?: number;

  constructor(
    private fb: FormBuilder,
    private sinaisVitaisService: SinaisVitaisService,
    private residentsService: ResidentsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.criarFormulario();
  }

  ngOnInit(): void {
    this.carregarResidentes();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.sinalVitalId = parseInt(id, 10);
      this.carregarSinalVital(this.sinalVitalId);
    }

    // Pre-selecionar residente se vier da rota
    const residenteId = this.route.snapshot.queryParamMap.get('residenteId');
    if (residenteId) {
      this.form.patchValue({ residenteId: parseInt(residenteId, 10) });
    }
  }

  criarFormulario(): void {
    this.form = this.fb.group({
      residenteId: [null, Validators.required],
      pressaoSistolica: [null, [Validators.min(60), Validators.max(250)]],
      pressaoDiastolica: [null, [Validators.min(40), Validators.max(150)]],
      temperatura: [null, [Validators.min(32), Validators.max(42)]],
      frequenciaCardiaca: [null, [Validators.min(30), Validators.max(220)]],
      saturacaoOxigenio: [null, [Validators.min(70), Validators.max(100)]],
      frequenciaRespiratoria: [null, [Validators.min(8), Validators.max(60)]],
      peso: [null, [Validators.min(20), Validators.max(300)]],
      altura: [null, [Validators.min(50), Validators.max(250)]],
      glicemia: [null, [Validators.min(20), Validators.max(600)]],
      observacoes: [''],
      dataMedicao: [new Date(), Validators.required],
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

  carregarSinalVital(id: number): void {
    this.loading = true;
    this.sinaisVitaisService.buscarPorId(id).subscribe({
      next: (sinalVital) => {
        this.form.patchValue({
          residenteId: sinalVital.residenteId,
          pressaoSistolica: sinalVital.pressaoSistolica,
          pressaoDiastolica: sinalVital.pressaoDiastolica,
          temperatura: sinalVital.temperatura,
          frequenciaCardiaca: sinalVital.frequenciaCardiaca,
          saturacaoOxigenio: sinalVital.saturacaoOxigenio,
          frequenciaRespiratoria: sinalVital.frequenciaRespiratoria,
          peso: sinalVital.peso,
          altura: sinalVital.altura,
          glicemia: sinalVital.glicemia,
          observacoes: sinalVital.observacoes,
          dataMedicao: new Date(sinalVital.dataMedicao),
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar sinais vitais:', error);
        this.snackBar.open('Erro ao carregar registro', 'Fechar', {
          duration: 3000,
        });
        this.loading = false;
        this.router.navigate(['/sinais-vitais']);
      },
    });
  }

  salvar(): void {
    if (this.form.valid) {
      this.loading = true;
      const dados = this.form.value;

      const operacao = this.isEditMode
        ? this.sinaisVitaisService.atualizar(this.sinalVitalId!, dados)
        : this.sinaisVitaisService.criar(dados);

      operacao.subscribe({
        next: () => {
          const mensagem = this.isEditMode
            ? 'Registro atualizado com sucesso'
            : 'Registro criado com sucesso';
          this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
          this.router.navigate(['/sinais-vitais']);
        },
        error: (error) => {
          console.error('Erro ao salvar sinais vitais:', error);
          this.snackBar.open('Erro ao salvar registro', 'Fechar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
    } else {
      this.marcarCamposInvalidos();
      this.snackBar.open('Preencha os campos obrigatorios', 'Fechar', {
        duration: 3000,
      });
    }
  }

  marcarCamposInvalidos(): void {
    Object.keys(this.form.controls).forEach((campo) => {
      const controle = this.form.get(campo);
      controle?.markAsTouched();
    });
  }

  cancelar(): void {
    this.router.navigate(['/sinais-vitais']);
  }

  get titulo(): string {
    return this.isEditMode
      ? 'Editar Sinais Vitais'
      : 'Novo Registro de Sinais Vitais';
  }
}

// Componente de formulario de sinais vitais
// Permite criar e editar registros de sinais vitais
// Validacao de ranges clinicos em tempo real
//    __  ____ ____ _  _
//  / _\/ ___) ___) )( \
// /    \___ \___ ) \/ (
// \_/\_(____(____|____/
