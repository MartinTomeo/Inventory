import { Routes } from '@angular/router';
import { HomePage } from './shared/pages/home-page/home-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
