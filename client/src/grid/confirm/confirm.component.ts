import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button'

@Component({
  imports:[MatDialogModule, MatButtonModule],
  selector: 'app-dialogo-confirmacion',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})
export class ConfirmacionComponent implements OnInit {
  constructor(
    public dialogo: MatDialogRef<ConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  no(): void {
    this.dialogo.close(false);
  }
  yes(): void {
    this.dialogo.close(true);
  }

  ngOnInit() {}
}
