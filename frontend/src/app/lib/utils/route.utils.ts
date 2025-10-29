import { CanActivateFn, Route, Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards';
import { pageTitleResolver } from '@shared/resolvers';

interface RouteConfig {
  path: string;
  title: string;
  loadComponent?: () => Promise<any>;
  loadChildren?: () => Promise<Routes>;
  canActivate?: CanActivateFn[];
  canActivateChild?: CanActivateFn[];
  children?: Routes;
}

export function createRoute({
  path,
  title,
  canActivate,
  canActivateChild,
  children,
  loadComponent,
  loadChildren,
}: RouteConfig): Route {
  return {
    path,
    loadComponent,
    loadChildren,
    canActivate,
    canActivateChild,
    children,
    resolve: { title: pageTitleResolver },
    data: { title },
  };
}

export function createProtectedRoute(config: RouteConfig): Route {
  return createRoute({
    ...config,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
  });
}
