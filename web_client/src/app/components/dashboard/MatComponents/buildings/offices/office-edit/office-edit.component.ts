import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuildingsService } from '../../../../../../services/buildings.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Building, Office } from '../../../../../../interfaces/interfaces';
import { OfficesService } from '../../../../../../services/offices.service';

@Component({
  selector: 'app-office-edit',
  standalone:true,
  imports:[CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './office-edit.component.html',
  styleUrls: ['./office-edit.component.css']
})

export class OfficeEditComponent {
  updateForm!: FormGroup;
  officeId!:string

  constructor(
    public dialogRef: MatDialogRef<OfficeEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private officeService:OfficesService,
    private snackBar:MatSnackBar,
    private fb:FormBuilder
  ) {
    this.initForm()
  }


  initForm(){
    this.updateForm = this.fb.group({
      office_name:''
    })
    this.prepopulate()
  }

  prepopulate(){
    this.officeId = this.data.id
    this.officeService.getOffices().subscribe(res=>{
      const office:Office = res.data.find(office=>office.id === this.officeId)  as Office
      this.updateForm.get('office_name')?.setValue(office.office_name)
    })
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    const updatedOfficeName:string = this.updateForm.get('office_name')?.value
    this.officeService.updateOffice(updatedOfficeName, this.data.id)
      .subscribe(
        (result: any) => {
          this.snackBar.open('Office updated successfully!', 'Close', {
            duration: 2000,
          });
          this.dialogRef.close(result);
        },
        (error: any) => {
          const fields = Object.keys(error.error)
        if(fields.length>0){
          const errorVariable = fields[0]
          const err = error.error[errorVariable][0]
          this.snackBar.open(`Error :${error.status}! ${error.error.message}.`, 'Close', {
            duration: 2000,
          });
        }
        }
      );
  }
}
