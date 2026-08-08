import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard.component';
import { ManagerDashboardComponent } from './pages/manager-dashboard/manager-dashboard.component';
import { customerGuard, managerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'customer',
    component: CustomerDashboardComponent,
    canActivate: [customerGuard]
  },
  {
    path: 'manager',
    component: ManagerDashboardComponent,
    canActivate: [managerGuard]
  },
  { path: '**', redirectTo: 'login' }
];
