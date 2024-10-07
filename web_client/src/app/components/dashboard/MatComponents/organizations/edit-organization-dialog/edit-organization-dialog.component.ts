import { Component, Inject, Signal, computed } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationsService } from '../../../../../services/organizations.service';
import { Organization } from '../../../../../interfaces/interfaces';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormControlName, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-organization-dialog',
  standalone:true, 
  imports:[MatFormFieldModule, FormsModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './edit-organization-dialog.component.html',
  styleUrls: ['./edit-organization-dialog.component.css'],
})
export class EditOrganizationDialogComponent {
  updatedOrganizationName!: FormGroup
  organization!:Organization;

  constructor(
    public dialogRef: MatDialogRef<EditOrganizationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private organizationService: OrganizationsService,
    private snackBar:MatSnackBar,
    private fb:FormBuilder
  ) {
    this.updatedOrganizationName = this.fb.group({
      name:''
    })
    this.prepopulate()
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  prepopulate(){
    this.organizationService.getOrganizations().subscribe(
      (res)=>{
        const organizations:Organization[] = res.data
        this.organization = organizations.find((organization)=>organization.id === this.data.id) as Organization
        this.updatedOrganizationName.get('name')?.setValue(this.data.name)
      }
    )
  }

  saveChanges(): void {
    this.organizationService
      .updateOrganization(this.data.id, this.updatedOrganizationName.get('name')?.value)
      .subscribe(
        (result: any) => {
          this.snackBar.open('Organization updated successfully!', 'Close', {
            duration: 2000,
          });
            this.dialogRef.close(result);
        },
        (error: any) => {
          const fields = Object.keys(error.error)
        if(fields.length>0){
          const errorVariable = fields[0]
          const err = error.error[errorVariable][0]
          this.snackBar.open(`Error :${error.status}! ${err}.`, 'Close', {
            duration: 2000,
          });
        }
        }
      );
  }
}
