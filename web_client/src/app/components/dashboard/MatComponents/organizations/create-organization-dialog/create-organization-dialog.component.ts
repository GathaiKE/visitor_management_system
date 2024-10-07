import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationsService } from '../../../../../services/organizations.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-organization-dialog',
  standalone:true, 
  imports:[MatFormFieldModule, FormsModule],
  templateUrl: './create-organization-dialog.component.html',
  styleUrls: ['./create-organization-dialog.component.css'],
})
export class CreateOrganizationDialogComponent {
  organizationName: string = '';
  @Output() organizationAdded: EventEmitter<void> = new EventEmitter<void>();
  
  constructor(
    public dialogRef: MatDialogRef<CreateOrganizationDialogComponent>,
    private organizationService: OrganizationsService,
    private snackbar:MatSnackBar
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveOrganization(): void {
    this.organizationService
      .createOrganization(this.organizationName)
      .subscribe(
        (response: any) => {
          this.snackbar.open('Admin Added successfully!', 'Close', {
            duration: 2000,
          });
          this.dialogRef.close(response);
          this.organizationAdded.emit();
        },
        (error: any) => {
          const fields = Object.keys(error.error)
        if(fields.length>0){
          const errorVariable = fields[0]
          const err = error.error[errorVariable][0]
          this.snackbar.open(`Error :${error.status}! ${err}.`, 'Close', {
            duration: 2000,
          });
        }
        }
      );
  }
}
