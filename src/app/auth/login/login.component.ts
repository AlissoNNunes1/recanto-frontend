import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loginAutomatico();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loginAutomatico() {
    this.authService.login().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
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
