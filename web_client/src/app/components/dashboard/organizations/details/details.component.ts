import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Admin, Building, NewBuilding, Organization } from '../../../../interfaces/interfaces';
import { BuildingsService } from '../../../../services/buildings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationsService } from '../../../../services/organizations.service';
import { DatePipe, Location, NgFor } from '@angular/common';
import { DualRowFormComponent } from '../../../../utilities/components/dual-row-form/dual-row-form.component';
import { HeaderComponent } from '../../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../../utilities/components/sidenav/sidenav.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';
import { AdminsService } from '../../../../services/admins.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, DatePipe, SpinnerComponent, NgFor, DualRowFormComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
  
  date = new Date()
  organization!:Organization
  user!:Admin
  organizations:Organization[] = []
  buildings:Building[] = []
  unfilteredBuildings:Building[] = []
  displayedData:Building[] = []
  showSpinner:boolean = false
  showForm:boolean = false
  showEditOrgForm:boolean = false
  isSuperUser:boolean = false
  formConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    name:{type:'text', label:'Name'},
    floors:{type:'number', label:'No of Floors'},
    location:{type:'text', label:'Location'},
    organization:{type:'select', label:"Organization"},
    status:{type:'checkbox', label:'Status'},
  }
  buildingForm!:FormGroup<any>

  updateOrgForm!:FormGroup<any>
  updateFormConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    name:{type:'text', label:'Name'},
    email:{type:'email', label:'Contact Email'},
    address:{type:'text', label:'Address'},
    phoneNumber:{type:'text', label:'Phone Number'},
    status:{type:'checkbox', label:'Status'},
  }

  constructor(
    private activeRoute:ActivatedRoute, 
    private buildingService:BuildingsService,
    private location:Location,
    private fb:FormBuilder,
    private organizationService:OrganizationsService,
    private adminService:AdminsService,
    private router:Router,
    private snackBar:MatSnackBar
  ){}

  ngOnInit(): void {
    this.showSpinner = true
    this.activeRoute.params.subscribe(params=>{
      const id = params['id']
      this.getOrganization(id)
      this.getBuildings(id)
      this.getOrganizations()
      this.getUser()
      this.initForm()
    })

  }

initForm(){
  this.buildingForm = this.fb.group({
    name:['', Validators.required],
    floors:[1, Validators.required],
    location:['', Validators.required],
    organization:['', Validators.required],
    status:[true, Validators.required],
  })

}

getUser(){
  const id:string = localStorage.getItem('user') as string
    this.adminService.getAdmin(id).subscribe(res=>{
      this.showSpinner = false
      if(res.data){
        this.user = res.data
      }
    })
}

  getBuildings(id:string){
    this.buildingService.getBuildings(id)
    this.buildingService.buildings$.subscribe(res=>{
      this.showSpinner = false
      if(res){
        this.buildings = res
      }
    })
  }

  getOrganization(id:string){
    this.organizationService.getOrganization(id).subscribe(res=>{
      if(res.data){
        this.organization = res.data

        this.updateOrgForm = this.fb.group({
          name:[this.organization?.organization_name, Validators.required],
          address:[this.organization?.address, Validators.required],
          email:[this.organization?.email, [Validators.required, Validators.email]],
          phoneNumber:[this.organization?.phone_number, Validators.required],
          status:[this.organization?.status, Validators.required]
        })
      }
    })
  }

  getOrganizations(){
    this.organizationService.getOrganizations()
    this.organizationService.orgnizations$.subscribe(res=>{
      if(res){
        this.organizations = res
      }
    })
  }

  openBuildingRegisterForm(){
    this.showForm = true
   }

   closeForm(){
    this.showForm = false
   }

   register(formData:any){
      let newBuilding:NewBuilding = {
        building_name:formData.name,
        floors:formData.floors,
        location:formData.location,
        organization:formData.organization,
        status:formData.status
      }
      console.log(newBuilding);
  
      this.buildingService.createBuilding(newBuilding).subscribe(res=>{
        if(res.id){
          this.snackBar.open('Building registered successfully', 'close',{
            duration:2000
          })
        } else{
          this.snackBar.open('Failed! Please check your internet connection and try again', 'close',{
            duration:3000
          })
        }
      })
   }

   openOrgUpdateForm(){
    this.showEditOrgForm = true
   }

   closeUpdateOrgForm(){
    this.showEditOrgForm = false
   }

   updateOrg(formData:any){
      let phone:string = (formData.phoneNumber)
    let phone_number_chars = phone.slice(-9)
    let phoneNumber:string = `254`+phone_number_chars

    let organization:Organization = {
      address:formData.address,
      email:formData.email,
      organization_name:formData.name,
      phone_number:phoneNumber,
      status:formData.status,
      created_at:this.organization.created_at,
      deleted_at:this.organization.deleted_at,
      id:this.organization.id,
      updated_at:this.organization.updated_at,
      organization_number:this.organization.organization_number,
    }

    this.organizationService.updateOrganization(organization).subscribe(res=>{
      if(res.id){
        this.getOrganization(this.organization.id)
        this.snackBar.open('Organization registered successfully', 'close',{
          duration:2000
        })
      } else{
        this.snackBar.open('Failed! Please check your internet connection and try again', 'close',{
          duration:3000
        })
      }
    })
   }
  

   details(id:string){
    this.router.navigate([`building-detail/${id}`])
   }




  goBack(){
    this.location.back()
  }


  updateUserInfo(){

  }

}
