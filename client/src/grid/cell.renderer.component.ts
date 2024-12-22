import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'grid-cell-renderer',
    standalone: true,
    imports: [CommonModule],
    styles: [`
    .label {
    display: inline;
    padding: 0.2em 0.6em 0.3em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25em;
}

.label-success{
    background-color: #5cb85c;
}
.label-danger{
    background-color: #d9534f;
}
    `],
    template: `
    <span *ngIf="userStatus" [ngClass]=" {'label':true,
    'label-danger': params?.data?.activated === false,
    'label-success': params?.data?.activated === true
}">
    {{params?.data?.activated? 'Activated' : 'Not Activated'}}
</span>
  `,
})
export class CellRendererComponent {
    public params?: any;
    get userStatus(): boolean {
        return this.params?.templateName.startsWith('<user-status');
    }
    agInit(params: any): void {
        this.params = params;
    }

}

