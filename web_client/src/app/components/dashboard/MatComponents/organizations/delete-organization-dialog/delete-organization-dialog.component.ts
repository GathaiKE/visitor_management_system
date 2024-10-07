import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationsService } from '../../../../../services/organizations.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-organization-dialog',
  standalone:true, 
  imports:[MatFormFieldModule, FormsModule, MatDialogModule],
  templateUrl: './delete-organization-dialog.component.html',
  styleUrls: ['./delete-organization-dialog.component.css'],
})
export class DeleteOrganizationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteOrganizationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private organizationService: OrganizationsService,
    private snackBar:MatSnackBar
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.dialogRef.close('confirm');
  }
}
