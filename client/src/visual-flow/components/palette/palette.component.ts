import {
  ChangeDetectionStrategy, Component,
  computed,
  input,
  signal,
} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { FFlowModule } from '@foblex/flow';


@Component({
  selector: 'visual-programming-palette',
  templateUrl: './palette.component.html',
  styleUrls: [ './palette.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FFlowModule,MatFormFieldModule,MatIconModule,MatInputModule
  ]
})
export class PaletteComponent {
  tableNames=input<string[]>([])
  searchText=signal('')
  fiteredTableNames=computed(()=>{
    const key=this.searchText().toLowerCase();
    const names= this.tableNames();
    if(!key)return names.slice(0,10);
    return names.filter(it=>it.includes(key)).slice(0,10)
  })

  onValChange(val:string){
    this.searchText.set(val);
  }

}
