import { Location } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, UrlTree } from '@angular/router';

type RouteCommands = any[];

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _location = inject(Location);

  navigate(commands: RouteCommands, extras?: NavigationExtras) {
    return this._router.navigate(commands, extras);
  }

  navigateByUrl(url: string, extras?: NavigationExtras) {
    return this._router.navigateByUrl(url, extras);
  }

  replaceUrl(url: string) {
    return this._router.navigateByUrl(url, { replaceUrl: true });
  }

  goBack() {
    this._location.back();
  }

  goToDashboard() {
    return this.navigate(['/dashboard']);
  }

  goToLogin() {
    return this.navigate(['/auth/login']);
  }

  goToVerifyEmail(email?: string, returnUrl: string = '/dashboard') {
    const queryParams: Record<string, string> = { returnUrl };
    if (email) queryParams['email'] = email;
    return this.navigate(['/auth/verify-email'], { queryParams });
  }

  getQueryParam<T = string>(key: string, route?: ActivatedRoute): T | null {
    const r = route ?? this._route;
    return (r.snapshot.queryParamMap.get(key) as unknown as T) ?? null;
  }

  updateQueryParams(params: Record<string, any>, extras?: Omit<NavigationExtras, 'queryParams'>) {
    const merged = { ...this._route.snapshot.queryParams, ...params };
    return this.navigate([], {
      queryParams: merged,
      queryParamsHandling: '',
      relativeTo: this._route,
      ...extras,
    });
  }

  clearQueryParams(extras?: Omit<NavigationExtras, 'queryParams'>) {
    return this.navigate([], { queryParams: {}, relativeTo: this._route, ...extras });
  }

  getCurrentUrl(): string {
    return this._router.url;
  }

  isActive(url: string, exact: boolean = true): boolean {
    return this._router.isActive(url, {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });
  }

  safeNavigate(commands: RouteCommands, extras?: NavigationExtras) {
    try {
      return this.navigate(commands, extras);
    } catch {
      // ignore
      return Promise.resolve(false);
    }
  }

  createUrlTree(commands: RouteCommands, extras?: NavigationExtras): UrlTree {
    return this._router.createUrlTree(commands as any, extras);
  }
}
