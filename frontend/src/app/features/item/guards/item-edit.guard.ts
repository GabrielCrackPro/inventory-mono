import { inject } from '@angular/core';
import { type CanActivateFn } from '@angular/router';
import { AccessService } from '@core/services/access';
import { RouterService } from '@core/services';
import { catchError, map, of } from 'rxjs';

export const canEditItemGuard: CanActivateFn = (route) => {
  const router = inject(RouterService);
  const access = inject(AccessService);

  const idParam = route.paramMap.get('id') ?? (route.params as any)?.['id'];
  const id = Number(idParam);
  if (!id || Number.isNaN(id)) {
    return router.createUrlTree(['/dashboard/items/list']);
  }

  return access.getItemAccess(id).pipe(
    map((acc) => (acc?.canEdit ? true : router.createUrlTree(['/dashboard/items/detail', id]))),
    catchError(() => of(router.createUrlTree(['/dashboard/items/detail', id]))),
  );
};
