// src/app/auth/login/login.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  ipNaoAutorizado: boolean = false;
  username: string = '';
  senha: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loginAutomatico();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loginAutomatico() {
    this.authService.getPublicIp().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (ip: string) => {
        this.authService.login(ip).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe({
          next: (response: any) => {
            console.log('Login successful');
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            localStorage.setItem('nome', response.nome);
            this.router.navigate(['/home']);
          },
          error: (err: any) => {
            if (err === 'IP não autorizado') {
              this.ipNaoAutorizado = true;
            } else {
              console.error('Login failed', err);
            }
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to get public IP', err);
      }
    });
  }

  onSubmit() {
    if (this.username && this.senha) {
      this.authService.login(undefined, this.username, this.senha).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe({
        next: (response: any) => {
          console.log('Login successful');
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('nome', response.nome);
          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          console.error('Login failed', err);
        }
      });
    }
  }
}
