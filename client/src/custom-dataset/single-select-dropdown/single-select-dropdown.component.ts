//@ts-nocheck
import { SPACE } from '@angular/cdk/keycodes';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormWrapperService } from '../services/form-wrapper.service';
import { Subject, takeUntil } from 'rxjs';
export interface Idata {
    label: string;
    value: string;
    icon?: string;
}
interface Iform {
    formObject: any;
    data: any;
}
@Component({
    standalone:false,
    selector: 'stl-single-select-dropdown',
    templateUrl: './single-select-dropdown.component.html',
    styleUrls: ['./single-select-dropdown.component.scss'],
})
export class SingleSelectDropdownComponent
    implements OnInit, OnChanges, OnDestroy,AfterViewInit
{
    destroy$ = new Subject<void>();
    @Input() label: string = '';
    @Input() name: string = '';

    @Input() dataSourceUrl: string = '';
    @Input() form: Iform;
    @Input() multiselect: boolean = true;
    @Input() inputData: Idata[] = [];

    @Input() selectedData: string = '-1';
    @Input() size: string = '';
    @Input() defaultDropDownData: string = 'Select Data';
    @Input() disabled: boolean = false;
    @Input() labelFieldName: string = '';
    @Input() valueFieldName: string = '';
    @Output() selectedItem = new EventEmitter();
    @Input() isRequired: boolean = false;
    @Input() searchEnable: boolean = true;
    @Input() payloadRequest;
    @Input() showLabel: boolean = true;
    @Input() stlFontsColumn: string = '';

    @Input() resetSelected: boolean = false;
    @ViewChild('select', { static: true }) select: any;

    isPanelOpen: boolean = false;
    validationActive: boolean = false;
    searchable: boolean = true;
    data: Idata[] = [];
    filteredData: Idata[] = [];
    filterText: string = '';
    constructor(private formService: FormWrapperService) {}

    typeCheck(val:any){
        return val;
    }
    ngAfterViewInit(): void {
        if (
            this.name.toLowerCase() === 'status' ||
            this.name.toLowerCase() === 'gender'
        ) {
            this.searchable = false;
        } else {
            this.searchable = this.searchEnable;
        }
    }

    ngOnChanges() {
        this.data = [{ label: this.defaultDropDownData, value: '-1' }];

        if (this.resetSelected) {
            this.form.formObject.get(this.name).setValue(null);
        }
        if (this.payloadRequest) {
            this.formService

                .getDataForRequestPayload(
                    this.dataSourceUrl,

                    this.payloadRequest
                )

                .pipe(takeUntil(this.destroy$))

                .subscribe({
                    next: (res: any) => {
                        res = res.result;

                        if (
                            this.labelFieldName != '' &&
                            this.valueFieldName != ''
                        )
                            this.customizeResponse(res);

                        this.data = [...res];

                        this.data.unshift({
                            label: this.defaultDropDownData,

                            value: '-1',
                        });

                        this.findFilteredData();

                        if (this.form)
                            this.selectedData = this.form.data
                                ? this.form.data
                                : '-1';
                    },
                });
        } else if (this.dataSourceUrl.length > 0) {
            this.formService

                .getDropdownData(this.dataSourceUrl)

                .pipe(takeUntil(this.destroy$))

                .subscribe({
                    next: (res: any) => {
                        if (
                            this.labelFieldName != '' &&
                            this.valueFieldName != ''
                        )
                            this.customizeResponse(res);

                        this.data = [...res];

                        this.data.unshift({
                            label: this.defaultDropDownData,

                            value: '-1',
                        });

                        this.findFilteredData();

                        if (this.form)
                            this.selectedData = this.form.data
                                ? this.form.data
                                : '-1';
                    },
                });
        } else {
            if (this.inputData && this.inputData.length > 0) {
                if (this.labelFieldName != '' && this.valueFieldName != '')
                    this.customizeResponse(this.inputData);

                this.data = [...this.inputData];

                this.data.unshift({
                    label: this.defaultDropDownData,

                    value: '-1',
                });

                this.findFilteredData();

                if (this.form)
                    this.selectedData = this.form.data ? this.form.data : '-1';
            } else {
                this.data = [];

                this.findFilteredData();
            }
        }
    }
    customizeResponse(res) {
        res.forEach((data) => {
            data['label'] = data[this.labelFieldName];
            data['value'] = data[this.valueFieldName];
        });
    }

    ngOnInit(): void {
        
        this.validationActive =
            this.form?.formObject?.controls[this.name]._rawValidators &&
            this.form?.formObject?.controls[this.name]._rawValidators.length
                ? true
                : false;
        this.select._handleKeydown = (event: KeyboardEvent) => {
            if (event.key === ' ') return;
            if (!this.select.disabled) {
                this.select.panelOpen
                    ? this.select._handleOpenKeydown(event)
                    : this.select._handleClosedKeydown(event);
            }
        };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    findFilteredData() {
        this.filteredData = this.data.filter((item, index) => {
            return index == 0
                ? true
                : item.label
                ? item.label
                      .toLowerCase()
                      .indexOf(this.filterText.trim().toLowerCase()) != -1
                : false;
        });
    }

    clearSearchBox() {
        this.filterText = '';
        this.findFilteredData();
    }

    applySearch() {
        this.findFilteredData();
    }

    selectPanelOpened(isOpened: boolean) {
        this.isPanelOpen = isOpened;
    }

    onSelectChange(event) {
        this.selectedData = event.value;
        this.filterText = '';
        if (event.value != -1) {
            this.selectedItem.emit(
                this.data.filter((item) => item.value == event.value).length
                    ? this.data.filter((item) => item.value == event.value)[0]
                    : {}
            );
            if (this.name && this.name.length > 0) {
                this.form.formObject.get(this.name).setValue(event.value);
            }
        } else {
            this.selectedItem.emit(
                this.data.filter((item) => item.value == event.value).length
                    ? { label: this.defaultDropDownData, value: null }
                    : {}
            );
            if (this.name.length > 0) {
                this.form.formObject.get(this.name).setValue(null);
            }
        }
        this.findFilteredData();
    }

    getOptionLabel(id: string) {
        const foundOption = this.filteredData.find(
            (option) => option.value === id
        );
        return foundOption ? foundOption.label : null;
    }
}
