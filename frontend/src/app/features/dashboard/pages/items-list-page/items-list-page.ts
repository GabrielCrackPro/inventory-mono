import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Item, ItemService } from '@features/item';
import { ZardButtonComponent } from '@ui/button';

@Component({
  selector: 'hia-items-list-page',
  imports: [ZardButtonComponent],
  templateUrl: './items-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsListPageComponent implements OnInit {
  private readonly _itemsService = inject(ItemService);
  private _items = signal<Item[]>([]);

  ngOnInit(): void {
    this._itemsService.getItems().subscribe((items) => {
      this._items.set(items);
      console.log(items);
    });
  }

  items = computed(() => this._items());
}
