import { Directive, Input, Renderer2 } from '@angular/core';
import { MatInput } from '@angular/material/input';

@Directive({
    standalone:false,
    selector: '[appDropdownSearchInputFocus]',
})
export class DropdownSearchInputFocusDirective {
    constructor(private input: MatInput, private renderer: Renderer2) {}

    @Input() set appDropdownSearchInputFocus(condition: boolean) {
        if (condition) {
            this.input.focus();
        }
    }
}
