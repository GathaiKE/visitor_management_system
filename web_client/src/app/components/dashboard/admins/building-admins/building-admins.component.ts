import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { FormComponent } from '../../../../utilities/components/form/form.component';
import { DualRowFormComponent } from '../../../../utilities/components/dual-row-form/dual-row-form.component';
import { Admin, Building, NewAdmin, Organization } from '../../../../interfaces/interfaces';
import { BuildingsService } from '../../../../services/buildings.service';
import { AdminsService } from '../../../../services/admins.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-building-admins',
  standalone: true,
  imports: [NgClass, RouterOutlet, FormComponent, DualRowFormComponent],
  templateUrl: './building-admins.component.html',
  styleUrl: './building-admins.component.css'
})
export class BuildingAdminsComponent {
  showForm:boolean = false
  buildings:Building[] = []
  user:Admin | null = null 
  formConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    firstName:{type:'text', label:'First Name'},
    middleName:{type:'text', label:'Middle Name'},
    lastName:{type:'text', label:'Last Name'},
    address:{type:'text', label:'Address'},
    idNumber:{type:'text', label:'Id Number'},
    email:{type:'email', label:'email'},
    phoneNumber:{type:'text', label:'Telephone'},
    building:{type:'select', label:'Building'},
    password:{type:'password', label:'Password'},
  }
  adminForm!:FormGroup<any>

  

  constructor(
    private router:Router, 
    private fb:FormBuilder,
    private buildingService:BuildingsService,
    private adminService:AdminsService,
    private snackBar:MatSnackBar
  ){}

ngOnInit(): void {
  this.navigate('admins/building/all')
  this.initForm()
  this.fetchData()
}

fetchData(){
  this.buildingService.getBuildings()
  this.buildingService.buildings$.subscribe(res=>{
    if(res){
      this.buildings = res
    }
  })
  this.adminService.getAdmin(localStorage.getItem('user') as string).subscribe(res=>{
    this.user = res.data
  })
}
  navigate(route:string){
    this.router.navigate([route])
  }
  
  activeRoute(route:string){
   return this.router.isActive(route, true)
 }

 initForm(){
  this.adminForm = this.fb.group({
    firstName:['', Validators.required],
    middleName:['', Validators.required],
    lastName:['', Validators.required],
    address:['', Validators.required],
    idNumber:['', Validators.required],
    email:['', [Validators.required, Validators.email]],
    phoneNumber:['', Validators.required],
    building:['', Validators.required],
    password:['', Validators.required]
  })
}
openForm(){
  this.showForm = true
 }
 register(formData:any){
    let phone:string = (formData.phoneNumber)
    let phone_number_chars = phone.slice(-9)
    let phoneNumber:string = `254`+phone_number_chars

    let newAdmin:NewAdmin = {
      email:formData.email,
      first_name:formData.firstName,
      is_active:true,
      is_admin:false,
      is_staff:false,
      is_superuser:true,
      last_name:formData.lastName,
      password:formData.password,
      phone_number:phoneNumber,
      username:formData.email,
      building:formData.building,
      is_assistant_super_admin:false,
      organization:this.user?.organization?.id,
      middle_name:formData.middleName,
      address:formData.address,
      id_number:formData.idNumber
    }

    this.adminService.registerAdmin(newAdmin).subscribe(res=>{
      if(res.id){
        this.snackBar.open('Admin registered successfully', 'close',{
          duration:2000
        })
      } else{
        this.snackBar.open('Failed! Please check your internet connection and try again', 'close',{
          duration:3000
        })
      }
    })
 }

 closeForm(){
  this.showForm = false
 }
}
