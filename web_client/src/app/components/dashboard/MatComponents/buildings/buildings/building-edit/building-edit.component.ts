import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuildingsService } from '../../../../../../services/buildings.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Building } from '../../../../../../interfaces/interfaces';

@Component({
  selector: 'app-building-edit',
  standalone:true,
  imports:[CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './building-edit.component.html',
  styleUrls: ['./building-edit.component.css']
})

export class BuildingEditComponent {
  updateForm!: FormGroup;
  buildId!:string

  constructor(
    public dialogRef: MatDialogRef<BuildingEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private buildingService: BuildingsService,
    private snackBar:MatSnackBar,
    private fb:FormBuilder
  ) {
    this.initForm()
  }


  initForm(){
    this.updateForm = this.fb.group({
      building_name:''
    })
    this.prepopulate()
  }

  prepopulate(){
    this.buildId = this.data.id
    this.buildingService.getBuildings().subscribe(res=>{
      const building:Building = res.data.find(b=>b.id === this.buildId)  as Building
      this.updateForm.get('building_name')?.setValue(building.building_name)
      console.log( this.updateForm.get('building_name')?.value)
    })
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    const updatedBuildingName:string = this.updateForm.get('building_name')?.value
    this.buildingService.updateBuilding(this.data.id, updatedBuildingName)
      .subscribe(
        (result: any) => {
          this.snackBar.open('Building updated successfully!', 'Close', {
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
