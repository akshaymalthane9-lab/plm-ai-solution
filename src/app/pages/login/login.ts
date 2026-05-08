import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserRole } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card card">
        <div class="logo flex items-center justify-center gap-2 mb-6">
          <div class="logo-icon">D</div>
          <h2>Deloitte AI<br><strong>PLM Platform</strong></h2>
        </div>
        <p class="text-center text-muted mb-6">Sign in to Enterprise Dashboard</p>
        
        <form (ngSubmit)="onSubmit()" class="flex-col gap-4">
          <div class="form-group flex-col">
            <label>Enterprise Username</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="e.g. Akshay Admin" 
              [(ngModel)]="username" 
              name="username" 
              required
            />
          </div>

          <div class="form-group flex-col">
            <label>Security Role (RBAC)</label>
            <select class="form-control" [(ngModel)]="selectedRole" name="role" required>
              <option value="PLM Admin">PLM Admin</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Read-Only Assessor">Read-Only Assessor</option>
            </select>
          </div>
          
          <button type="submit" class="btn btn-primary w-full mt-2" [disabled]="!username.trim()">Authenticate</button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .login-wrapper { height: 100vh; display: flex; align-items: center; justify-content: center; background-color: var(--bg-app); }
    .login-card { width: 400px; padding: 2.5rem; background: var(--bg-surface); box-shadow: var(--shadow-float); }
    .logo-icon { width: 40px; height: 40px; background: var(--accent-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; border-radius: 4px; font-family: var(--font-heading); }
    .logo h2 { font-size: 1.1rem; line-height: 1.2; font-weight: 400; color: var(--text-primary); margin:0;}
    .mb-6 { margin-bottom: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .text-center { text-align: center; }
    .text-muted { color: var(--text-muted); font-size: 0.875rem; }
    .w-full { width: 100%; justify-content: center; padding: 0.75rem; }
  `
})
export class Login {
  username = '';
  selectedRole: UserRole = 'PLM Admin';
  private userService = inject(UserService);
  private router = inject(Router);

  onSubmit() {
    if (this.username.trim()) {
      this.userService.login(this.username.trim(), this.selectedRole);
      this.router.navigate(['/dashboard']);
    }
  }
}
