import { Routes } from '@angular/router';
import { AuditoriaComponent } from './auditoria/auditoria/auditoria.component';
import { AdminAuthGuard } from './auth/auth-admin.guard';
import { AuthGuard } from './auth/auth-guard.service';
import { LoginComponent } from './auth/login/login.component';
import { AddFuncionarioFormComponent } from './funcionarios/add-funcionario-form/add-funcionario-form.component';
import { FuncionariosComponent } from './funcionarios/funcionarios/funcionarios.component';
import { HomeComponent } from './home/home.component';
import { IpsAutorizadosComponent } from './ips-autorizados/ips-autorizados/ips-autorizados.component';
import { ConsultaEditComponent } from './prontuarios/consulta-edit/consulta-edit.component';
import { ConsultaFormComponent } from './prontuarios/consulta-form/consulta-form.component';
import { ExameEditComponent } from './prontuarios/exame-edit/exame-edit.component';
import { ExameFormComponent } from './prontuarios/exame-form/exame-form.component';
import { MedicamentoEditComponent } from './prontuarios/medicamento-edit/medicamento-edit.component';
import { MedicamentoFormComponent } from './prontuarios/medicamento-form/medicamento-form.component';
import { ProntuarioDetailComponent } from './prontuarios/prontuario-detail/prontuario-detail.component';
import { ProntuariosComponent } from './prontuarios/prontuarios/prontuarios.component';
import { ResidentDetailComponent } from './residents/resident-detail/resident-detail.component';
import { ResidentsComponent } from './residents/residents/residents.component';
import { UsuariosComponent } from './usuarios/usuarios/usuarios.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'residents',
    component: ResidentsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'resident-detail/:id',
    component: ResidentDetailComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'funcionarios',
    component: FuncionariosComponent,
    canActivate: [AuthGuard, AdminAuthGuard],
  },
  {
    path: 'funcionarios/add',
    component: AddFuncionarioFormComponent,
    canActivate: [AuthGuard, AdminAuthGuard],
  },
  {
    path: 'prontuarios',
    component: ProntuariosComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prontuario-detail/:id',
    component: ProntuarioDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prontuario/:prontuarioId/consulta/add',
    component: ConsultaFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prontuario/:prontuarioId/consulta/:consultaId/edit',
    component: ConsultaEditComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prontuario/:prontuarioId/exame/add',
    component: ExameFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prontuario/:prontuarioId/exame/:exameId/edit',
    component: ExameEditComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prontuario/:prontuarioId/medicamento/add',
    component: MedicamentoFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'prontuario/:prontuarioId/medicamento/:medicamentoId/edit',
    component: MedicamentoEditComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard, AdminAuthGuard],
  },
  {
    path: 'ips-autorizados',
    component: IpsAutorizadosComponent,
    canActivate: [AuthGuard, AdminAuthGuard],
  },
  {
    path: 'auditoria',
    component: AuditoriaComponent,
    canActivate: [AuthGuard, AdminAuthGuard],
  },
];
