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
  usesStandaloneShell = signal(false);

  constructor() {
    this.updateShellState(this.router.url);
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateShellState(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub.unsubscribe();
  }

  private updateShellState(url: string) {
    const path = url.split('?')[0];
    const isItemDetail = /^\/items\/[^/]+$/.test(path);
    const isItemEdit = /^\/items\/[^/]+\/edit$/.test(path);
    this.usesStandaloneShell.set(path === '/dashboard' || path === '/items' || isItemDetail || isItemEdit);
  }
}
