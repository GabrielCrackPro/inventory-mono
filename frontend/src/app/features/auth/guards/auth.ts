import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { TokenService } from '@core/services';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const stateUrl = typeof state?.url === 'string' ? state.url : String(state?.url ?? '/');

  if (tokenService.isAuthenticated()) {
    if (stateUrl.includes('auth') || stateUrl === '/') {
      return router.createUrlTree(['/dashboard']);
    }

    return true;
  }

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: stateUrl } });
};
