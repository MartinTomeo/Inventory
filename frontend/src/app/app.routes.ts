import { Routes } from '@angular/router';
import { LoginPage } from './auth/pages/login-page/login-page';
import { authenticatedGuard } from './auth/guards/authenticated.guard';
import { notAuthenticatedGuard } from './auth/guards/not-authenticated.guard';


export const routes: Routes = [

  {
    path: '',
    component: LoginPage,
    canActivate: [notAuthenticatedGuard],
  },
  {
    path: 'user',
    canActivate: [authenticatedGuard],
    loadChildren: () => import('./user/user.routes').then((m) => m.userRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },

];
