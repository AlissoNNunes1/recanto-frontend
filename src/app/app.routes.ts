import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { ResidentsComponent } from './residents/residents/residents.component';
import { AuthGuard } from './auth/auth-guard.service';
import { ResidentDetailComponent } from './residents/resident-detail/resident-detail.component';
import { FuncionariosComponent } from './funcionarios/funcionarios/funcionarios.component';
import { AdminAuthGuard } from './auth/auth-admin.guard';
import { AddFuncionarioFormComponent } from './funcionarios/add-funcionario-form/add-funcionario-form.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, },
    { path: 'residents', component: ResidentsComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
    { path: 'resident-detail/:id', component: ResidentDetailComponent, canActivate: [AuthGuard] },
    {path:'', redirectTo: '/home', pathMatch: 'full'},
    {path:'funcionarios', component: FuncionariosComponent, canActivate: [AuthGuard, AdminAuthGuard]},
    {path:'funcionarios/add', component: AddFuncionarioFormComponent, canActivate: [AuthGuard, AdminAuthGuard]},
  ];
