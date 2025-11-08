import { Routes } from '@angular/router';
import { createProtectedRoute, createRoute } from '@lib/utils';

export const dashboardRoutes: Routes = [
  createProtectedRoute({
    title: 'Dashboard',
    path: '',
    children: [
      createRoute({
        title: 'Home',
        path: '',
        loadComponent: () => import('./pages').then((m) => m.HomeComponent),
      }),
      createRoute({
        title: 'Items',
        path: 'items/list',
        loadComponent: () => import('./pages').then((m) => m.ItemsListPageComponent),
      }),
      createRoute({
        title: 'Item Detail',
        path: 'items/detail/:id',
        loadComponent: () => import('./pages').then((m) => m.ItemDetailPageComponent),
      }),
      createRoute({
        title: 'Edit Item',
        path: 'items/edit/:id',
        loadComponent: () => import('./pages').then((m) => m.AddItemComponent),
      }),
      createRoute({
        title: 'Add Item',
        path: 'items/new',
        loadComponent: () => import('./pages').then((m) => m.AddItemComponent),
      }),
    ],
  }),
  createRoute({
    title: 'Not Found',
    path: 'not-found',
    loadComponent: () => import('./pages').then((m) => m.NotFoundComponent),
  }),
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
