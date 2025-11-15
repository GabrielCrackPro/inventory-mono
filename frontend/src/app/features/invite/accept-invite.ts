import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, RouterService, TokenService } from '@core/services';
import { ToastService } from '@shared/services';
import { ZardCardComponent } from '@ui/card';
import { ZardButtonComponent } from '@ui/button';

interface InviteSummary {
  email: string;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
  expiresAt: string;
  usedAt?: string | null;
  house: { id: number; name: string };
  expired: boolean;
}

@Component({
  selector: 'hia-accept-invite',
  standalone: true,
  imports: [CommonModule, RouterLink, ZardCardComponent, ZardButtonComponent, TitleCasePipe, DatePipe],
  templateUrl: './accept-invite.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptInvitePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(RouterService);
  private readonly toast = inject(ToastService);

  readonly token = signal<string>('');
  readonly loading = signal<boolean>(true);
  readonly accepting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly invite = signal<InviteSummary | null>(null);

  readonly isAuthed = computed(() => this.tokenService.isAuthenticated());

  ngOnInit() {
    const t = this.route.snapshot.queryParamMap.get('token') || '';
    this.token.set(t);
    if (!t) {
      this.error.set('Missing token');
      this.loading.set(false);
      return;
    }
    this.api.get<InviteSummary>('invites', undefined, t).subscribe({
      next: (res) => {
        if (!res) {
          this.error.set('This invite was canceled or is no longer valid.');
          this.invite.set(null);
        } else {
          this.invite.set(res);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'This invite was canceled or is no longer valid.');
        this.loading.set(false);
      },
    });
  }

  onAccept() {
    const t = this.token();
    if (!t) return;
    this.accepting.set(true);
    this.api.postTo<{ ok: boolean; houseId: number }, { token: string }>('invites', 'accept', { token: t }).subscribe({
      next: (res) => {
        this.accepting.set(false);
        this.toast.success({ title: 'Invite accepted', message: 'Access granted to the house.' });
        this.router.goToDashboard();
      },
      error: (err) => {
        this.accepting.set(false);
        const msg = err?.message || 'Failed to accept invite';
        this.error.set(msg);
        this.toast.error({ title: 'Error', message: msg });
      },
    });
  }
}
