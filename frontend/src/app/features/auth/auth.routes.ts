import { Routes } from '@angular/router';
import { createRoute } from '@lib/utils';

export const authRoutes: Routes = [
  createRoute({
    title: 'Auth',
    path: '',
    children: [
      createRoute({
        title: 'Login',
        path: 'login',
        loadComponent: () =>
          import('@features/auth/pages/login/login').then((m) => m.LoginComponent),
      }),
      createRoute({
        title: 'Register',
        path: 'register',
        loadComponent: () =>
          import('@features/auth/pages/register/register').then((m) => m.RegisterComponent),
      }),
      createRoute({
        title: 'Reset Password',
        path: 'reset-password',
        loadComponent: () =>
          import('@features/auth/pages/reset-password/reset-password').then(
            (m) => m.ResetPasswordComponent
          ),
      }),
    ],
  }),
];
