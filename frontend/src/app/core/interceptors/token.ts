import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@core/services';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((err) => {
      const status = err?.status;
      // If unauthorized, clear tokens and redirect to login
      if (status === 401) {
        tokenService.clearTokens();
        try {
          router.navigate(['/auth/login']);
        } catch (e) {
          // navigation may fail during some phases; ignore
        }
      }

      return throwError(() => err);
    })
  );
};
