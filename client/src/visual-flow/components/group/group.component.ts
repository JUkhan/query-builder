import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FFlowModule, EFResizeHandleType } from '@foblex/flow';
import { IFlowGroupViewModel } from '../../domain/group/i-flow-group-view-model';


@Component({
  selector: 'visual-programming-group',
  templateUrl: './group.component.html',
  styleUrls: [ './group.component.scss' ],
  standalone: true,
  imports: [
    FFlowModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent implements OnInit {

  @Input()
  public group: IFlowGroupViewModel | undefined;
  protected readonly eResizeHandleType = EFResizeHandleType;

  ngOnInit(): void {
    // Initialization logic here
  }
}
