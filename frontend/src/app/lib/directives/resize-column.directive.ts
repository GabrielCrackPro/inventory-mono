import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[zResizeCol]'
  , standalone: true
})
export class ResizeColumnDirective implements OnDestroy {
  @Input() key!: string;
  @Input() minWidth = 80;
  @Output() widthChange = new EventEmitter<number>();

  private _resizing: { startX: number; startWidth: number; th: HTMLElement } | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(evt: MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    const th = (this.el.nativeElement.closest('th') as HTMLElement) || undefined;
    if (!th) return;
    this._resizing = { startX: evt.clientX, startWidth: th.offsetWidth, th };
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
  }

  private _onMouseMove = (evt: MouseEvent) => {
    if (!this._resizing) return;
    const dx = evt.clientX - this._resizing.startX;
    const newWidth = Math.max(this.minWidth, this._resizing.startWidth + dx);
    this.widthChange.emit(newWidth);
  };

  private _onMouseUp = () => {
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    this._resizing = null;
  };

  ngOnDestroy(): void {
    this._onMouseUp();
  }
}
