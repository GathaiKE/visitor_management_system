import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-admin',
  standalone: true,
  imports: [],
  templateUrl: './delete-admin.component.html',
  styleUrl: './delete-admin.component.css'
})
export class DeleteAdminComponent {
  constructor(private dialogRef: MatDialogRef<DeleteAdminComponent>,
  ) {}
  cancel() {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.dialogRef.close('confirm');
  }
}
