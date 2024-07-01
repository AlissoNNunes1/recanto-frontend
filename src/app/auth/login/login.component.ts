// src/app/auth/login/login.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], // Add FormsModule to the component's imports
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  senha: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.senha).subscribe({
      next: (response: any) => { // Adicione o tipo 'any' ou um tipo mais específico se disponível
        console.log('Login successful');
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        this.router.navigate(['/home']);
      },
      error: (err: any) => { // Adicione o tipo 'any' ou um tipo mais específico se disponível
        console.error('Login failed', err);
      }
    });
  }
}