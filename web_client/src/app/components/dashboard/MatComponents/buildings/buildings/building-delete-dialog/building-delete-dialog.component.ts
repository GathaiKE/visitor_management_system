import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-building-delete-dialog',
  standalone:true,
  imports:[MatButtonModule],
  templateUrl: './building-delete-dialog.component.html',
  styleUrls: ['./building-delete-dialog.component.scss'],
})
export class BuildingDeleteDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BuildingDeleteDialogComponent>,
  ) {}
  cancel() {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.dialogRef.close('confirm');
  }
}
