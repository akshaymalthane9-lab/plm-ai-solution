import { Injectable, signal } from '@angular/core';

export type UserRole = 'PLM Admin' | 'Product Manager' | 'Read-Only Assessor';

@Injectable({ providedIn: 'root' })
export class UserService {
  currentUser = signal<string | null>(null);
  currentRole = signal<UserRole | null>(null);

  constructor() {
    const savedName = localStorage.getItem('deloitte_user');
    const savedRole = localStorage.getItem('deloitte_role') as UserRole;
    if (savedName) {
      this.currentUser.set(savedName);
      this.currentRole.set(savedRole || 'PLM Admin');
    }
  }

  login(username: string, role: UserRole) {
    this.currentUser.set(username);
    this.currentRole.set(role);
    localStorage.setItem('deloitte_user', username);
    localStorage.setItem('deloitte_role', role);
  }

  logout() {
    this.currentUser.set(null);
    this.currentRole.set(null);
    localStorage.removeItem('deloitte_user');
    localStorage.removeItem('deloitte_role');
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isReadOnly(): boolean {
    return this.currentRole() === 'Read-Only Assessor';
  }
}
