import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loginAutomatico();
  }

  loginAutomatico() {
    this.authService.login().subscribe({
      next: (response: any) => {
        console.log('Login successful');
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error('Login failed', err);
      }
    });
  }
}
