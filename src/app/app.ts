import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
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
export class AppComponent {
  title = 'deloitte-ai-plm';
  public userService = inject(UserService);
}
