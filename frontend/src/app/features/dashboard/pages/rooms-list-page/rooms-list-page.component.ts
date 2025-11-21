import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { commonIcons } from '@core/config';
import { HouseContextService } from '@features/house/services/house-context';
import { RoomService } from '@features/room';
import { ProfileService } from '@features/user';
import { Room } from '@shared/models';
import { AlertDialogService } from '@shared/services';
import { ZardBreadcrumbComponent, ZardBreadcrumbItemComponent } from '@ui/breadcrumb';
import { ZardButtonComponent } from '@ui/button';
import { ZardCardComponent } from '@ui/card';
import { ZardEmptyComponent } from '@ui/empty';
import { IconComponent } from '@ui/icon';

interface RoomWithCount extends Room {
  _count?: {
    items?: number;
  };
}

@Component({
  selector: 'hia-rooms-list-page',
  imports: [
    ZardBreadcrumbComponent,
    ZardBreadcrumbItemComponent,
    ZardButtonComponent,
    ZardCardComponent,
    ZardEmptyComponent,
    IconComponent,
  ],
  templateUrl: './rooms-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomsListPageComponent implements OnInit {
  private readonly roomService = inject(RoomService);
  private readonly profileService = inject(ProfileService);
  private readonly houseContext = inject(HouseContextService);
  private readonly alertDialogService = inject(AlertDialogService);
  private readonly router = inject(Router);

  protected readonly commonIcons = commonIcons;
  protected readonly rooms = signal<RoomWithCount[]>([]);
  protected readonly loading = signal(true);
  protected readonly selectedHouseId = computed(
    () => this.profileService.getProfile()?.selectedHouseId
  );

  ngOnInit(): void {
    this.loadRooms();

    // Reload rooms when house changes
    this.houseContext.selectedHouseChanged$.subscribe(() => {
      this.loadRooms();
    });
  }

  loadRooms(): void {
    const houseId = this.selectedHouseId();
    if (!houseId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  navigateToRoom(roomId: number): void {
    // Navigate to items list page filtered by this room
    this.router.navigate(['/dashboard/items/list'], {
      queryParams: { room: roomId },
    });
  }

  deleteRoom(room: Room, event: Event): void {
    event.stopPropagation();

    this.alertDialogService.confirm({
      zTitle: 'Delete Room',
      zDescription: `Are you sure you want to delete "${room.name}"? This action cannot be undone.`,
      zIcon: 'lucideTrash2',
      zType: 'destructive',
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => this.performDelete(room.id),
    });
  }

  private performDelete(roomId: number): void {
    this.roomService.deleteRoom(String(roomId)).subscribe({
      next: () => {
        this.rooms.update((rooms) => rooms.filter((r) => r.id !== roomId));
      },
    });
  }

  getRoomIcon(_room: RoomWithCount): string {
    return commonIcons['room'];
  }

  getItemCount(room: RoomWithCount): number {
    return room._count?.items ?? 0;
  }
}
