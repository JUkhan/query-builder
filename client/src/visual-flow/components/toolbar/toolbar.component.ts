import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { FlowComponent } from '../flow/flow.component';

@Component({
  selector: 'visual-programming-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: [ './toolbar.component.scss' ],
  imports:[MatIconModule,MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {

  constructor(
    private flowComponent: FlowComponent
  ) {
  }

  public onZoomIn(): void {
    this.flowComponent.fZoomDirective.zoomIn();
  }

  public onZoomOut(): void {
    this.flowComponent.fZoomDirective.zoomOut();
  }

  public onFitToScreen(): void {
    this.flowComponent.fCanvasComponent.fitToScreen();
  }

  public onOneToOne(): void {
    this.flowComponent.fCanvasComponent.resetScaleAndCenter()
  }
}
