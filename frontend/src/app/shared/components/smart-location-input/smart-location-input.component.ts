import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@ui/form';
import { ZardInputDirective } from '@ui/input';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'hia-smart-location-input',
  imports: [
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SmartLocationInputComponent,
      multi: true,
    },
  ],
  template: `
    <z-form-field>
      <z-form-label>{{ label() }}</z-form-label>
      <z-form-control [helpText]="helpText()">
        <input
          z-input
          type="text"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [placeholder]="placeholder()"
        />
      </z-form-control>
    </z-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartLocationInputComponent implements ControlValueAccessor {
  private readonly _roomService = inject(RoomService);

  // Inputs
  label = input<string>('Specific Location');
  roomType = input<string>('');

  // Internal state
  private _value = '';
  private _onChange = (value: string) => {};
  private _onTouched = () => {};

  // Computed properties
  placeholder = computed(() => {
    const roomType = this.roomType();
    return roomType
      ? this._roomService.getRandomPlaceholder(roomType)
      : 'e.g., Top shelf, Under sink, Drawer 2';
  });

  helpText = computed(() => {
    const roomType = this.roomType();
    if (!roomType) return 'Be specific to help you find items quickly';

    const roomInfo = this._roomService.getRoomTypeInfo(roomType);
    return roomInfo.helpText;
  });

  value = computed(() => this._value);

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._value = target.value;
    this._onChange(this._value);
  }

  onBlur(): void {
    this._onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value || '';
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
