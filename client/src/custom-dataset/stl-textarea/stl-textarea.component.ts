import { Component, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
    standalone:false,
    selector: 'stl-textarea',
    templateUrl: './stl-textarea.component.html',
    styleUrls: ['./stl-textarea.component.scss'],
})
export class StlTextareaComponent implements ControlValueAccessor {
    @Input() label!: string;
    @Input() name!: string;
    @Input() required!: boolean;
    @Input() isReadOnly: boolean = false;
    constructor(@Self() public ngControl: NgControl) {
        this.ngControl.valueAccessor = this;
    }
    getControl(){
        return this.ngControl?.control as any
    }
    ngOnInit(): void {}

    writeValue(obj: any): void {}
    registerOnChange(fn: any): void {}
    registerOnTouched(fn: any): void {}
}
