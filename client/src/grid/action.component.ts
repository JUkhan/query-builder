import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConstantService } from '../services/constants.service';
import { MatDialog } from "@angular/material/dialog";
import { Action, dispatch } from '../services/state';
import { ConfirmacionComponent } from './confirm/confirm.component';
//import { FuseConfirmationService } from '@streamstech/ui-sdk/fuse/services';

@Component({
    selector: 'grid-actions',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule
    ],
    styles: [`
        .mat-icon {
            font-size: 20px;
            cursor: pointer;
            padding: 2px 5px;
            margin-right: 3px;
            height: 30px;
            width: 30px;
        }
        .mat-icon:hover{
            background-color: #ffffff;
            border-radius: 50%;
        }
    `],
    template: `
    <mat-icon *ngIf="params?.hasEditPermission" (click)="editRowData()" matTooltip="edit">edit</mat-icon>
    <mat-icon *ngIf="params?.hasDeletePermission" (click)="deleteRowData()" matTooltip="delete">delete</mat-icon>
    <ng-container *ngIf="!suppressCustomButtons">
        <ng-container  *ngFor="let btn of params?.customButtons">
            <mat-icon  (click)="customActionHandler(btn)" [matTooltip]="btn.tooltip">{{btn.icon}}</mat-icon>
        </ng-container>
    </ng-container>
    <ng-container *ngIf="params.buttonTemplate" [ngTemplateOutlet]="params.buttonTemplate" [ngTemplateOutletContext]="{data:params.data}"></ng-container>
  `,
})
export class ActionComponent {
    @Input() suppressCustomButtons=false;
    public params?: any;
    constructor(
        public dialogo: MatDialog,
        private constant: ConstantService,
        //private _fuseConfirmationService: FuseConfirmationService,
        ){}
    agInit(params: any): void {
        this.params = params;
    }
    customActionHandler(btnInfo: {actionName: string}): void{
        dispatch(new CustomAction(btnInfo.actionName, this.params?.data));
        if(typeof this.params[btnInfo.actionName] ==='function'){
            this.params[btnInfo.actionName](this.params?.data)
        }
    }
    editRowData(): void {
        if (this.params?.crudEdit) {
            this.params?.crudEdit(this.params?.data);
        }
    }
    deleteRowData(): void {
        if (this.params?.crudDelete) {
            this.dialogo.open(ConfirmacionComponent, { data:{
                title: ConstantService.Message.DELETE_SUCCESSFUL_TITLE,
                message: ConstantService.Message.DELETE_SUCCESSFUL_MESSAGE,
                }}).afterClosed()
                .subscribe((result: boolean) =>{
                if (result){
                     this.params?.crudDelete(this.params?.data);
                }
            });
            /*this._fuseConfirmationService.open({
                title: ConstantService.Message.DELETE_SUCCESSFUL_TITLE,
                message: ConstantService.Message.DELETE_SUCCESSFUL_MESSAGE,
                // message: `Are you sure you want to delete this ${this.row.model}?`,
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn',
                },
                actions: {
                    confirm: {
                        show: true,
                        label: 'Yes',
                        color: 'warn',
                    },
                    cancel: {
                        show: true,
                        label: 'No',
                    },
                },
                dismissible: true,
            }).afterClosed().subscribe((result) =>{
                if (result === 'confirmed'){
                     this.params?.crudDelete(this.params?.data);
                }
            });*/
        }
    }
}

export class EditAction<T extends object> implements Action{
    constructor(public type: any, public data: T){}
}
export class DeleteAction<T extends object> implements Action{
    constructor(public type: any, public data: T){}
}
export class CustomAction<T extends object> implements Action{
    constructor(public type: any, public data: T){}
}
