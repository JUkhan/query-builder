// @ts-nocheck

import { Component, ElementRef, Input, OnInit, ViewChild, Inject } from '@angular/core';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ColDef } from 'ag-grid-community';
import {
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
  standalone:false,
  selector: 'stl-grid-column-selector-vd',
  templateUrl: './column-selector.component.html',
  styleUrls: ['./column-selector.component.scss']
})
export class ColumnSelectorComponent implements OnInit {

  columnDefs: ColDef[];

  @ViewChild('SearchColumnInput') searchColumnInput!: ElementRef;

  filteredColumns: any[] = [];

  faCheck = faCheck;
  faXmark = faXmark;
  matDialogConfig: MatDialogConfig = new MatDialogConfig();
  callback: (arr: string[], flag: boolean) => void;
  private readonly _matDialogRef: MatDialogRef<ColumnSelectorComponent>;
  private readonly triggerElementRef: ElementRef;
  constructor(
    _matDialogRef: MatDialogRef<ColumnSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    this._matDialogRef = _matDialogRef;
    this.triggerElementRef = data.trigger;
    this.columnDefs = data.columnDefs;
    this.callback = data.callback;
  }

  ngOnInit(): void {
    this.searchColumnByString('');
    this.updateMatDialogPosition();
  }
  updateMatDialogPosition(): void {
    const rect =
        this.triggerElementRef.nativeElement.getBoundingClientRect();
    //(rect.left, rect.right);
    this.matDialogConfig.position = {
        // left: `${rect.left-280}px`,
        right: `${window.innerWidth - rect.right - 20}px`,
        top: `${rect.bottom + 10}px`,
    };

    this.matDialogConfig.width = '370px';
    this.matDialogConfig.minHeight = '300px';

    this._matDialogRef.updateSize(
        this.matDialogConfig.width,
        this.matDialogConfig.height
    );

    this._matDialogRef.updatePosition(this.matDialogConfig.position);
}
  toggleDisplayValue(column: any): void {
    column.visible = !column.visible;
    this.callback([column.field], column.visible);
  }
  selectAll(): void {
    this.selectAllBy(true);
  }
  selectNone(): void {
    this.selectAllBy(false);
  }
  reset(): void {
    this.selectAllBy(true);
  }
  selectAllBy(flag: boolean): void {
    this.filteredColumns = this.columnDefs.map((it: any) =>{
      it.visible=flag;
      return it;
    });
    this.callback(this.columnDefs.filter(it=>it.field).map((it: any)=>it.field), flag);
  }
  applyFilter(event: Event): void {
    let filterValue = (event.target as HTMLInputElement).value;
    filterValue = filterValue.trim().toLowerCase();
    this.searchColumnByString(filterValue);
  }

  searchColumnByString(filterValue: string): void {
    this.filteredColumns = this.columnDefs
    .filter((column: any) => column.headerName.toLowerCase().includes(filterValue));
  }

  clearSearchBox(): void {
    this.searchColumnInput.nativeElement.value = '';
    this.searchColumnByString('');
  }
  checkColumnInputValue(): boolean {
    return this.searchColumnInput?.nativeElement.value ? true : false;
  }
  getCheckedLen(): number{
    return this.filteredColumns.filter(it=>it.visible).length;
  }
}
