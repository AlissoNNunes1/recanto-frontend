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
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful');
        // Save token to localStorage or session storage if needed
        // For example:
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('role', response.role);
        this.router.navigate(['/home']); // Navigate after successful login
      },
      error: (err) => {
        console.error('Login failed', err);
        // Display error message to the user if needed
      }
    });
  }
}