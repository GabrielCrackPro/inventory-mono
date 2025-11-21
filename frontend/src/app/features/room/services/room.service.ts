import { HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { ProfileService } from '@features/user';
import { HouseContextService } from '@features/house/services/house-context';
import { Observable } from 'rxjs';
import { Room, CreateRoomData, UpdateRoomData } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiService = inject(ApiService);
  private readonly profileService = inject(ProfileService);
  private readonly houseContext = inject(HouseContextService);

  userId = computed(() => this.profileService.getProfile()?.id);

  /**
   * Gets all rooms for the active house
   */
  getRooms(): Observable<Room[]> {
    const houseId =
      this.houseContext.currentSelectedHouseId() ??
      this.profileService.getProfile()?.selectedHouseId;

    if (!houseId) {
      throw new Error('No house selected');
    }

    // Use the rooms endpoint with houseId query parameter
    let params = new HttpParams().set('houseId', String(houseId));
    return this.apiService.get<Room[]>('rooms', params);
  }

  /**
   * Gets a single room by ID
   */
  getRoom(id: string): Observable<Room> {
    return this.apiService.getOne<Room>('rooms', id);
  }

  /**
   * Creates a new room
   */
  createRoom(data: CreateRoomData): Observable<Room> {
    const houseId =
      this.houseContext.currentSelectedHouseId() ??
      this.profileService.getProfile()?.selectedHouseId;

    if (!houseId) {
      throw new Error('No house selected');
    }

    const roomData = {
      ...data,
      houseId,
    };

    return this.apiService.post<Room, CreateRoomData>('rooms', roomData);
  }

  /**
   * Updates an existing room
   */
  updateRoom(id: string, data: UpdateRoomData): Observable<Room> {
    return this.apiService.patch<Room, UpdateRoomData>('rooms', id, data);
  }

  /**
   * Deletes a room
   */
  deleteRoom(id: string): Observable<void> {
    return this.apiService.delete<void>('rooms', id);
  }

  /**
   * Gets rooms with optional filtering
   */
  getRoomsFiltered(filters?: { search?: string; type?: string }): Observable<Room[]> {
    const houseId =
      this.houseContext.currentSelectedHouseId() ??
      this.profileService.getProfile()?.selectedHouseId;

    if (!houseId) {
      throw new Error('No house selected');
    }

    let params = new HttpParams();
    if (filters?.search) params = params.append('search', filters.search);
    if (filters?.type) params = params.append('type', filters.type);

    return this.apiService.get<Room[]>('rooms', params);
  }

  /**
   * Gets room statistics
   */
  getRoomStats(): Observable<{
    totalRooms: number;
    roomsByType: Record<string, number>;
  }> {
    return this.apiService.get('stats');
  }
}
