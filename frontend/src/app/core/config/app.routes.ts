import { Routes } from '@angular/router';
import { createProtectedRoute, createRoute } from '@lib/utils';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  createRoute({
    title: 'Auth',
    path: 'auth',
    loadChildren: () => import('@features/auth').then((m) => m.authRoutes),
  }),

  createProtectedRoute({
    title: 'Dashboard',
    path: 'dashboard',
    loadComponent: () =>
      import('@features/dashboard/layout/dashboard-layout').then((m) => m.DashboardLayoutComponent),
    loadChildren: () =>
      import('@features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  }),

  { path: '**', redirectTo: 'auth' },
];
