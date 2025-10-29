import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZardSelectComponent, ZardSelectItemComponent } from '@ui/select';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@ui/form';
import { IconComponent } from '@ui/icon';
import { RoomDisplayComponent, RoomDisplayData } from '../room-display';
import { RoomService } from '../../services/room.service';
import { HouseService } from '@features/house';

@Component({
  selector: 'hia-room-selector',
  imports: [
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    IconComponent,
    RoomDisplayComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RoomSelectorComponent,
      multi: true,
    },
  ],
  template: `
    <z-form-field>
      <z-form-label [zRequired]="required()">{{ label() }}</z-form-label>
      <z-form-control [errorMessage]="errorMessage() || ''">
        <z-select
          [zValue]="value()"
          (zSelectionChange)="onSelectionChange($event)"
          zPlaceholder="Select a room"
        >
          @for (room of rooms(); track room.value) {
          <z-select-item [zValue]="room.value">
            <hia-room-display [room]="room" />
          </z-select-item>
          }

          <!-- Add New Room Option -->
          @if (allowAddNew()) {
          <z-select-item zValue="__add_new__" class="border-t border-border mt-2 pt-2">
            <div class="flex items-center gap-3 text-primary">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <hia-icon name="Plus" class="h-4 w-4 text-primary" />
              </div>
              <span class="font-medium">Add New Room</span>
            </div>
          </z-select-item>
          }
        </z-select>
      </z-form-control>
    </z-form-field>

    <!-- Selected Room Indicator -->
    @if (selectedRoom() && showSelectedIndicator()) {
    <div class="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
      <div class="flex items-center gap-3">
        <hia-room-display [room]="selectedRoom()!" />
        <div class="ml-auto">
          <div class="text-xs text-muted-foreground">Items will be stored here</div>
        </div>
      </div>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomSelectorComponent implements OnInit, ControlValueAccessor {
  private readonly _roomService = inject(RoomService);
  private readonly _houseService = inject(HouseService);

  // Inputs
  label = input<string>('Room');
  required = input<boolean>(true);
  errorMessage = input<string>('');
  allowAddNew = input<boolean>(true);
  showSelectedIndicator = input<boolean>(true);

  // Outputs
  roomAdded = output<RoomDisplayData>();

  // Internal state
  private _rooms = signal<any[]>([]);
  private _value = signal<string>('');
  private _onChange = (value: string) => {};
  private _onTouched = () => {};

  // Computed properties
  rooms = computed(() =>
    this._rooms().map((room) => this._roomService.transformRoomForDisplay(room))
  );

  selectedRoom = computed(() => {
    const selectedValue = this._value();
    return this.rooms().find((r) => r.value === selectedValue) || null;
  });

  value = computed(() => this._value());

  ngOnInit(): void {
    this._houseService.getActiveHouseRooms().subscribe((rooms) => {
      this._rooms.set(rooms);
    });
  }

  onSelectionChange(value: string): void {
    if (value === '__add_new__') {
      this.handleAddNewRoom();
      return;
    }

    this._value.set(value);
    this._onChange(value);
    this._onTouched();
  }

  private handleAddNewRoom(): void {
    // Reset to prevent "__add_new__" from being the actual value
    const roomName = prompt('Enter the name of the new room:');

    if (roomName && roomName.trim()) {
      const newRoomData = this._roomService.transformRoomForDisplay({
        name: roomName.trim(),
        description: null,
      });

      // Add the new room to the list
      this._rooms.update((rooms) => [
        ...rooms,
        {
          name: newRoomData.name,
          description: newRoomData.description,
        },
      ]);

      // Select the new room
      this._value.set(newRoomData.value);
      this._onChange(newRoomData.value);
      this._onTouched();

      // Emit the new room data
      this.roomAdded.emit(newRoomData);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
