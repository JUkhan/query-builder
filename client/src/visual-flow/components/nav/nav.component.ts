import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { QueryBuilderStore } from '../../../custom-dataset/query-builder/utils/query-builder.store';
import { QueryBuilderService } from '../../../custom-dataset/query-builder/utils/services/query-builder.service';
import { WhereConditionComponent } from '../../../custom-dataset/query-builder/where-condition/where-condition.component';
import { OrderByComponent } from '../../../custom-dataset/query-builder/order-by/order-by.component';
import { SelectContainerComponent } from '../../../custom-dataset/query-builder/select-container/select-container.component';
import { FlowComponent } from '../flow/flow.component';
import { PreviewComponent } from '../../../custom-dataset/query-builder/preview/preview.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flow-nav',
  imports: [MatButtonModule, MatBottomSheetModule, MatSnackBarModule, CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  private buttomSheet = inject(MatBottomSheet);
  private dialogRef = inject(MatDialogRef);
  private queryBuilderStore = inject(QueryBuilderStore);
  //private queryBuilderService = inject(QueryBuilderService);
  private _snackBar = inject(MatSnackBar);
  private flowComponent = inject(FlowComponent)
  
   
  public get  isSaveDisabled(){
    const fullJsonData = this.queryBuilderStore.getFullJsonData(
      this.queryBuilderStore.getCurrentQueryIndex()
    );
    if(!fullJsonData) return true;
    return !Array.isArray(fullJsonData.selectClauseCols)
  }
  
  onSave() {
    const fullJsonData = this.queryBuilderStore.getFullJsonData(
      this.queryBuilderStore.getCurrentQueryIndex()
    );
    if(!fullJsonData || fullJsonData && !fullJsonData.webQuery){
      this._snackBar.open('Empty query', '', {duration:3000, verticalPosition:'top'})
    }
    
    if(fullJsonData.webQuery.endsWith('WHERE\r\n')){
      this._snackBar.open('You need to add filter condition', '', {duration:3000, verticalPosition:'top'})
    }
    this.dialogRef.close({
      saveClicked: true,
      query:fullJsonData.webQuery,
      index: this.queryBuilderStore.getCurrentQueryIndex(),
    });

    //this.saveFullJsonDataToStore(generatedQuery);
  }
  onOpenFilterConditions(){
    this.buttomSheet.open(WhereConditionComponent);
    this.queryBuilderStore.QueryBuilderState$.subscribe(res=>console.log(res))
  }
  onOpenSelectColumns(){
    this.buttomSheet.open(SelectContainerComponent)
  }
  openOrderBy(){
    this.buttomSheet.open(OrderByComponent)
  }
  openPreview(){
    
    this.queryBuilderStore.patchStateAllQueries('joinConfigs', this.flowComponent.getJoinConditions())
   
    this.buttomSheet.open(PreviewComponent)
  }
}
