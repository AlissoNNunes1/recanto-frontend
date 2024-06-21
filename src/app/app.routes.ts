import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { ResidentsComponent } from './residents/residents/residents.component';
import { AuthGuard } from './auth/auth-guard.service';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, },
    { path: 'residents', component: ResidentsComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard]}
  ];