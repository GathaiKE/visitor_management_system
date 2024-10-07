import { Component, Signal, computed } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organization } from '../../../../../../interfaces/interfaces';
import { BuildingsService } from '../../../../../../services/buildings.service';
import { OrganizationsService } from '../../../../../../services/organizations.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../../services/auth.service';

interface formData {
  building_name:string,
  organization:string
}

@Component({
  selector: 'app-create-building',
  standalone:true,
  imports:[ FormsModule, CommonModule, ReactiveFormsModule ],
  templateUrl: './create-building.component.html',
  styleUrls: ['./create-building.component.css']
})
export class CreateBuildingComponent {
  buildingForm!: FormGroup;
  allOrganizations!: Signal<Organization[]>
  orgId!:string
  organizations!: Organization[]
  isSuperAdmin:boolean  = false
  isClientAdmin:boolean = false

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateBuildingComponent>,
    private snackBar: MatSnackBar,
    private buildingService: BuildingsService,
    private organizationService:OrganizationsService,
    private authService:AuthService
  ) {
    this.initForm();
    this.fetchData();
  }

  fetchData(){
    this.organizationService.getOrganizations().subscribe(res=>{
      this.allOrganizations = computed(()=>res.data)
      this.organizations = this.allOrganizations()
    })
    this.orgId = this.authService.user.organization?.id as string
  }

  
  initForm() {
    let loggedUser:string;
    switch (true) {
      case this.authService.isSuperAdmin():
        this.isSuperAdmin = true
        this.buildingForm = this.fb.group({
          organization: ['', Validators.required],
          building_name: ['', Validators.required]
        })
        break;
      case this.authService.isClientAdmin():
        this.isClientAdmin = true
        this.buildingForm = this.fb.group({
          building_name: ['', Validators.required],
        });
        break;
      default:
        this.isSuperAdmin = false
        this.isClientAdmin = false
        this.buildingForm = this.fb.group({
          organization: ['', Validators.required],
          building_name: ['', Validators.required]
        })
        break;
    }
    
  }

  add() {
    if (this.buildingForm.valid) {
      const formData:formData = {
        building_name:this.buildingForm.get('building_name')?.value,
        organization:this.authService.isClientAdmin()?this.orgId:this.buildingForm.get('organization')?.value
      };

      this.buildingService
        .createBuilding(formData.building_name, formData.organization)
        .subscribe(
          (response) => {
            this.dialogRef.close(response);
          },
          (error) => {
            this.snackBar.open('Failed to create building', 'Close', {
              duration: 2000,
            });
          }
        );
    } else {
      this.snackBar.open('Form is invalid', 'Close', {
        duration: 2000,
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
