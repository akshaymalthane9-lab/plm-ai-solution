import { Component, inject, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';
import { AiAssistant } from './components/ai-assistant/ai-assistant';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Sidebar, Header, AiAssistant],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnDestroy {
  title = 'deloitte-ai-plm';
  public userService = inject(UserService);
  private router = inject(Router);
  private routerSub: Subscription;
  isDashboard = signal(false);

  constructor() {
    this.updateDashboardState(this.router.url);
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateDashboardState(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub.unsubscribe();
  }

  private updateDashboardState(url: string) {
    this.isDashboard.set(url.split('?')[0] === '/dashboard');
  }
}
