import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormComponent } from '../../../../utilities/components/form/form.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DualRowFormComponent } from '../../../../utilities/components/dual-row-form/dual-row-form.component';
import { NewAdmin } from '../../../../interfaces/interfaces';
import { AdminsService } from '../../../../services/admins.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-super-admins',
  standalone: true,
  imports: [RouterOutlet, NgClass, FormComponent, DualRowFormComponent],
  templateUrl: './super-admins.component.html',
  styleUrl: './super-admins.component.css'
})
export class SuperAdminsComponent implements OnInit{
  showForm:boolean = false
  formConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    firstName:{type:'text', label:'First Name'},
    middleName:{type:'text', label:'Middle Name'},
    lastName:{type:'text', label:'Last Name'},
    address:{type:'text', label:'Address'},
    idNumber:{type:'text', label:'Id Number'},
    email:{type:'email', label:'Email'},
    phoneNumber:{type:'text', label:'Phone Number'},
    password:{type:'password', label:'Password'},
  }
  adminForm!:FormGroup<any>

  constructor(private router:Router, private fb:FormBuilder, private adminService:AdminsService, private snackBar:MatSnackBar){}

ngOnInit(): void {
  this.navigate('admins/assistant/all')
  this.initForm()
}

initForm(){
  this.adminForm = this.fb.group({
    firstName:['', Validators.required],
    middleName:['', Validators.required],
    address:['', Validators.required],
    idNumber:['', Validators.required],
    lastName:['', Validators.required],
    email:['', [Validators.required, Validators.email]],
    phoneNumber:['', Validators.required],
    password:['', Validators.required]
  })
}

  navigate(route:string){
    this.router.navigate([route])
  }
  
  activeRoute(route:string){
   return this.router.isActive(route, true)
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
      is_superuser:false,
      last_name:formData.lastName,
      password:formData.password,
      phone_number:phoneNumber,
      username:formData.email,
      building:'',
      is_assistant_super_admin:true,
      organization:'',
      middle_name:formData.middleName,
      address:formData.address,
      id_number:formData.idNumber
    }

    this.adminService.registerAdmin(newAdmin).subscribe(res=>{
      console.log('assistant:',res)
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

