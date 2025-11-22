import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZardCheckboxComponent } from '@ui/checkbox/checkbox.component';
import { ZardRadioComponent } from '@ui/radio';

@Component({
  selector: 'hia-dashboard-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ZardCheckboxComponent, ZardRadioComponent],
  templateUrl: './dashboard-export-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardExportModalComponent {
  scope: 'all' | 'low-stock' = 'all';
  format: 'csv' | 'json' = 'csv';
  fields = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'room', label: 'Room' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unit', label: 'Unit' },
  ] as const;
  selectedFields: string[] = this.fields.map((f) => f.key);

  onOk(): boolean {
    // Handled via zOnOk callback wired from opener
    return true;
  }

  toggleField(key: string, checked: boolean) {
    if (checked) {
      if (!this.selectedFields.includes(key)) this.selectedFields = [...this.selectedFields, key];
    } else {
      this.selectedFields = this.selectedFields.filter((k) => k !== key);
    }
  }

  selectAllFields() {
    this.selectedFields = this.fields.map((f) => f.key);
  }

  clearAllFields() {
    this.selectedFields = [];
  }
}
