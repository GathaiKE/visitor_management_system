import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminsService } from '../../../services/admins.service';
import { Admin, Building, Organization } from '../../../interfaces/interfaces';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DualRowFormComponent } from '../../../utilities/components/dual-row-form/dual-row-form.component';
import { OrganizationsService } from '../../../services/organizations.service';
import { BuildingsService } from '../../../services/buildings.service';
import { FormComponent } from '../../../utilities/components/form/form.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-detail',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, DatePipe, SpinnerComponent, DualRowFormComponent, FormComponent],
  templateUrl: './admin-detail.component.html',
  styleUrl: './admin-detail.component.css'
})
export class AdminDetailComponent implements OnInit{
  date = new Date()
  user!:Admin
  showSpinner:boolean = false
  showUpdateUserForm:boolean = false
  showReassignAdminForm:boolean = false
  adminUpdateFormConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={}
  updateAdminForm!:FormGroup<any>
  data:Building[] | Organization[] = []
  reassignAdminForm!:FormGroup<any>
  reassignAdminFormConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={}


  constructor(
    private activeRoute:ActivatedRoute, 
    private adminService:AdminsService, 
    private location:Location,
    private fb:FormBuilder,
    private organizationService:OrganizationsService,
    private buildingService:BuildingsService,
    private snackBar:MatSnackBar
  ){}

  ngOnInit(): void {
    this.showSpinner = true
    this.activeRoute.params.subscribe(params=>{
      const id = params['id']
    this.getAdmin(id)
    })
  }

  getAdmin(id:string){
    this.adminService.getAdmin(id).subscribe(res=>{
      this.showSpinner = false
      if(res.data){
        this.user = res.data

        this.adminUpdateFormConfig = {
          firstName:{type:'text', label:'First Name'},
          middleName:{type:'text', label:'Middle Name'},
          lastName:{type:'text', label:'Last Name'},
          address:{type:'text', label:'Address'},
          idNumber:{type:'text', label:'Id Number'},
          email:{type:'email', label:'Email'},
          phoneNumber:{type:'text', label:'Phone Number'},
        }

        switch(true){
          case this.user.is_admin:
            this.reassignAdminFormConfig = {
              organization:{label:'Organization', type:'select'}
            }
            break;
          case this.user.is_staff:
            this.reassignAdminFormConfig = {
              building:{label:'Building', type:'select'}
            }
            break;
          default:
            break;
        }
        this.initForm(res.data)
        this.fetchData(res.data)
      }
    })
  }
  fetchData(user:Admin){
    switch(true){
      case user.is_admin:
        this.organizationService.getOrganizations()
        this.organizationService.orgnizations$.subscribe(res=>{
          if(res){
            this.data = res
          }
        })
        break;
      case user.is_staff:
        this.buildingService.getBuildings(user.organization?.id)
        this.buildingService.buildings$.subscribe(res=>{
          if(res){
            this.data = res
          }
        })
        break;
      default:
      break;
    }
    

  }

  initForm(user:Admin){
    this.updateAdminForm = this.fb.group({
      firstName:[this.user.first_name, Validators.required],
      middleName:[this.user.middle_name, Validators.required],
      lastName:[this.user.last_name, Validators.required],
      address:[this.user.address, Validators.required],
      idNumber:[this.user.id_number, Validators.required],
      email:[this.user.email, [Validators.required, Validators.email]],
      phoneNumber:['+'+this.user.phone_number, Validators.required],
    })

    switch(true){
      case user.is_admin:
      this.reassignAdminForm = this.fb.group({
        organization:['', Validators.required]
      })
      break;
      case user.is_staff:
        this.reassignAdminForm = this.fb.group({
          building:['', Validators.required]
        })
        break;
      default:
      break;
    }
  }

  goBack(){
    this.location.back()
  }


  updateAdmin(data:any){
    console.log(data)

    let admin:Admin = {
      date_joined:this.user?.date_joined,
      email:data.email,
      first_name:data.firstName,
      groups:this.user.groups,
      id:this.user.id,
      is_active:data.status,
      is_admin:this.user.is_admin,
      is_assistant_superuser:this.user.is_assistant_superuser,
      is_checked_in:this.user.is_checked_in,
      is_phone_verified:this.user.is_phone_verified,
      is_staff:this.user.is_staff,
      is_superuser:this.user.is_superuser,
      is_visitor:this.user.is_visitor,
      last_login:this.user.last_login,
      last_name:data.last_name,
      middle_name:data.middle_name,
      otp:this.user.otp,
      otp_expiry:this.user.otp_expiry,
      password:this.user.password,
      phone_number:data.phoneNumber,
      user_permissions:this.user.user_permissions,
      username:data.email,
      address:data.address,
      building:this.user.building,
      id_number:data.id_number,
      organization:this.user.organization
    }

    this.adminService.updateAdmin(admin).subscribe(res=>{
      if(res.id){
        this.getAdmin(this.user.id)
        this.snackBar.open('Admin Updated successfully', 'close',{
          duration:2000
        })
      } else{
        this.snackBar.open('Failed! Please check your internet connection and try again', 'close',{
          duration:3000
        })
      }
    })
    }

  closeUpdteAdminForm(){
    this.showUpdateUserForm = false
  }

  openUpdateAdminForm(){
    this.showUpdateUserForm = true
  }

  openReassignAdminForm(){
    this.showReassignAdminForm = true
  }

  closeReassignAdminForm(){
    this.showReassignAdminForm = false
  }

  reassignAdmin(data:any){
    console.log(data)
  }
}
