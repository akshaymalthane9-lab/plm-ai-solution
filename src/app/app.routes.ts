import { Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './services/user.service';
import { Dashboard } from './pages/dashboard/dashboard';
import { Items } from './pages/inventory/inventory';
import { ItemDetails } from './pages/item-details/item-details';
import { ItemEdit } from './pages/item-edit/item-edit';
import { Login } from './pages/login/login';
import { Changes } from './pages/changes/changes';
import { ChangesReview } from './pages/changes-review/changes-review';

const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = inject(UserService);
  return user.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'items', component: Items, canActivate: [authGuard] },
  { path: 'items/create', component: Items, canActivate: [authGuard] },
  { path: 'items/:sku/edit', component: ItemEdit, canActivate: [authGuard] },
  { path: 'items/:sku', component: ItemDetails, canActivate: [authGuard] },
  { path: 'changes', component: Changes, canActivate: [authGuard] },
  { path: 'changes/create', component: Changes, canActivate: [authGuard] },
  { path: 'changes/manage', component: Changes, canActivate: [authGuard] },
  { path: 'changes/review', component: ChangesReview, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
