// app.component.ts

import { Component, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet,Router,NavigationEnd } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, MdbCollapseModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'recanto';

  showNav: boolean = false;

  constructor(private router: Router) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.showNav = val.url !== '/login';
      }
    });
  }
}
