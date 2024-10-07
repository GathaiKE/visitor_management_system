import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Building, NewAdminFormData, Organization } from '../../../../../interfaces/interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BuildingsService } from '../../../../../services/buildings.service';
import { AuthService } from '../../../../../services/auth.service';
import { Observable, map } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrganizationsService } from '../../../../../services/organizations.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminsService } from '../../../../../services/admins.service';
import { HttpErrorResponse } from '@angular/common/http';
import { json } from 'stream/consumers';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, MatButtonModule, MatTooltipModule],
  templateUrl: './add-admin.component.html',
  styleUrl: './add-admin.component.css'
})
export class AddAdminComponent {
registerForm!:FormGroup
buildings!:Building[]
organizations!:Organization[]
enableBuildingsSelect:boolean = false
adminType!: 'client' | 'building' | 'assistant'
showBuildingForm:boolean = false
showAsisstantForm:boolean = false
showClientForm:boolean = false
activeUser:boolean = this.authService.isSuperAdmin()



constructor(
  private dialogRef:MatDialogRef<AddAdminComponent>, 
  private authService:AuthService,
  private organizationService:OrganizationsService,
  private buildingService:BuildingsService,
  private adminService:AdminsService,
  private fb:FormBuilder,
  @Inject(MAT_DIALOG_DATA) private data:{type:Observable<'client'| 'building' | 'assistant'>},
  private snackBar:MatSnackBar
  ){
    this.fetchData()
    this.initForm(this.data.type)
  }

  defaultOrg:string = 'Select an Organization'

  adminValue():string{
    let data$:Observable<'client' | 'building' | 'assistant'> = this.data.type
    let value:string = '';
    data$.subscribe(val=>{
      if(val === 'client'){
        value = 'Organization'
      } else if(val === 'assistant'){
        value = 'Assistant'
      } else{
        value = 'Building'
      }
    })
    return value;
  }

  initForm(data$:Observable<'client' | 'building' | 'assistant'>){
  data$.subscribe(value=>{
  
    switch (value) {
      case 'building':
        this.showBuildingForm = true
        this.registerForm = this.fb.group({
          first_name:['', [Validators.required, Validators.min(2)]],
          last_name:['', [Validators.required, Validators.min(2)]],
          username:['', [Validators.required, Validators.min(2)]],
          email:['', [Validators.required, Validators.email]],
          building:['', Validators.required],
          organization:['', Validators.required],
          password:['', [Validators.minLength(6), Validators.required]],
          telephone:['', [Validators.required, Validators.minLength(9)]]
        })
        break;
      case 'assistant':
        this.showAsisstantForm = true
        this.registerForm = this.fb.group({
          first_name:['', [Validators.required, Validators.min(2)]],
          last_name:['', [Validators.required, Validators.min(2)]],
          username:['', [Validators.required, Validators.min(2)]],
          email:['', [Validators.required, Validators.email]],
          password:['', [Validators.minLength(6), Validators.required]],
          telephone:['', [Validators.required, Validators.minLength(9)]]
        })
        break;
      case 'client':
        this.showClientForm = true
        this.registerForm = this.fb.group({
          first_name:['', [Validators.required, Validators.min(2)]],
          last_name:['', [Validators.required, Validators.min(2)]],
          username:['', [Validators.required, Validators.min(2)]],
          email:['', [Validators.required, Validators.email]],
          organization:['', [Validators.required]],
          password:['', [Validators.minLength(6), Validators.required]],
          telephone:['', [Validators.required, Validators.minLength(9)]]
        })
        break;
      default:
        this.snackBar.open('Unexpected error occured','close',{duration:2500})
        break;
    }
  })
  }

  loadBuildings(){
    this.enableBuildingsSelect = true?this.enableBuildingsSelect = false:this.enableBuildingsSelect = true
    this.buildingService.getBuildings().pipe(map(res=>res.data)).subscribe(b=>{
      this.buildings = b.filter(b=>b.organization?.id === this.registerForm.get('organization')?.value) as Building[]
    })
    }

  fetchData(){
    let user = this.authService.user
    let loggedUser: string = '';
    if(user.is_admin){
      loggedUser = 'client'
    } else if(user.is_staff){
      loggedUser = 'building'
    } else if(user.is_superuser){
      loggedUser = 'super'
    } else{
      loggedUser = 'unauthorized'
    }

    switch (loggedUser) {
      case 'super':
        this.organizationService.getOrganizations().pipe(map(res=>res.data)).subscribe(orgs=>{
          this.organizations = orgs
        })
        break;
      case 'client':
        this.organizationService.getOrganizations().pipe(map(res=>res.data)).subscribe(orgs=>{
          this.organizations = orgs.filter(org=>org.id === user.organization?.id)
        })
        this.buildingService.getBuildings().pipe(map(res=>res.data)).subscribe(buildings=>{
          this.buildings = buildings.filter(b=>b.organization?.id === user.organization?.id)
        })
        break;
      case 'building':
        this.buildings = []
        this.organizations = []
        break;
      case 'unauthorized':
        this.buildings = []
        this.organizations = []
        break;
      default:
        this.buildings = []
        this.organizations = []
        break;
    }
  }

  register(){
    if(this.registerForm.valid){
      this.data.type.subscribe(val=>{
        const payload:NewAdminFormData = {
         firstName:this.registerForm.get('first_name')?.value,
         lastName:this.registerForm.get('last_name')?.value,
         username:this.registerForm.get('username')?.value,
         email:this.registerForm.get('email')?.value,
         organization:this.registerForm.get('organization')?.value,
         building:this.registerForm.get('building')?.value,
         password:this.registerForm.get('password')?.value,
         phoneNumber:this.registerForm.get('telephone')?.value
        }
        this.adminService.registerAdmin(payload,val).subscribe(res=>{
          this.snackBar.open('Registration Successful', 'close', {duration:2500})
          this.dialogRef.close(res)
        },
        (error:HttpErrorResponse)=>{
          const fields = Object.keys(error.error)
          if(fields.length>0){
            const errorVariable = fields[0]
            const err = error.error[errorVariable][0]
            this.snackBar.open(`Error :${error.status}! ${err}.`, 'Close', {duration:2500});
          }
        }
        )
      })
    }
  }
  cancel(){
    this.dialogRef.close()
  }
}
