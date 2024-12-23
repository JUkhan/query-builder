import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { QueryBuilderStore } from '../../../custom-dataset/query-builder/utils/query-builder.store';
import { QueryBuilderService } from '../../../custom-dataset/query-builder/utils/services/query-builder.service';
import { WhereConditionComponent } from '../../../custom-dataset/query-builder/where-condition/where-condition.component';
import { SelectColumnsComponent } from '../../../custom-dataset/query-builder/select-columns/select-columns.component';
import { OrderByComponent } from '../../../custom-dataset/query-builder/order-by/order-by.component';

@Component({
  selector: 'app-flow-nav',
  imports: [MatButtonModule, MatBottomSheetModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  private buttomSheet = inject(MatBottomSheet);
  private dialogRef = inject(MatDialogRef);
  private queryBuilderStore = inject(QueryBuilderStore);
  private queryBuilderService = inject(QueryBuilderService);

  onSave() {
    console.log(this.queryBuilderStore.getCurrentQueryIndex());
    //const generatedQuery = this.queryBuilderService.buildQuery(this.generateBuildQueryPayload());
    this.dialogRef.close({
      saveClicked: true,
      query: '', //generatedQuery,
      index: this.queryBuilderStore.getCurrentQueryIndex(),
    });

    //this.saveFullJsonDataToStore(generatedQuery);
  }
  onOpenFilterConditions(){
    //this.buttomSheet.open(WhereConditionComponent)
    this.queryBuilderStore.QueryBuilderState$.subscribe(res=>console.log(res))
  }
  onOpenSelectColumns(){
    this.buttomSheet.open(SelectColumnsComponent)
  }
  openOrderBy(){
    this.buttomSheet.open(OrderByComponent)
  }
  openPreview(){
    //this.buttomSheet.open(PreviewC)

  }
}
