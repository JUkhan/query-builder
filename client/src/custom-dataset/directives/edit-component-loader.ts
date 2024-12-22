
import { Directive, HostListener, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({
  standalone:false,
  selector: '[clickOutside]'
})
export class CloseMatInputOnOutsideClickDirective {
  @Output() clickOutside = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }
}