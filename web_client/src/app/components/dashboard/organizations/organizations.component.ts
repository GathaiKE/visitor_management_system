import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DualRowFormComponent } from '../../../utilities/components/dual-row-form/dual-row-form.component';
import { NewOrganization } from '../../../interfaces/interfaces';
import { OrganizationsService } from '../../../services/organizations.service';
import { MatSnackBar } from '@angular/material/snack-bar';




@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [RouterOutlet, NgClass, HeaderComponent, SidenavComponent, DualRowFormComponent],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.css'
})
export class OrganizationsComponent implements OnInit{
  showForm:boolean = false
  formConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    name:{type:'text', label:'Name'},
    email:{type:'email', label:'Contact Email'},
    address:{type:'text', label:'Address'},
    phoneNumber:{type:'text', label:'Phone Number'},
    status:{type:'checkbox', label:'Status'},
  }

  form!:FormGroup<any>
  
  constructor(
    private router:Router,
    private fb:FormBuilder,
    private organizationService:OrganizationsService,
    private snackBar:MatSnackBar
  ){}

  ngOnInit(): void {
    this.navigate('organizations/all')
    this.initForm()
  }
  
  initForm(){
    this.form = this.fb.group({
      name:['', Validators.required],
      address:['', Validators.required],
      email:['', [Validators.required, Validators.email]],
      phoneNumber:['', Validators.required],
      status:[true, Validators.required]
    })
  }

  openForm(){
    this.showForm = true
   }
   register(formData:any){
    let phone:string = (formData.phoneNumber)
    let phone_number_chars = phone.slice(-9)
    let phoneNumber:string = `254`+phone_number_chars

    let newOrg:NewOrganization = {
      address:formData.address,
      email:formData.email,
      organization_name:formData.name,
      phone_number:phoneNumber,
      status:formData.status
    }

    this.organizationService.createOrganization(newOrg).subscribe(res=>{
      if(res.id){
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
  
   closeForm(){
    this.showForm = false
   }
   details(id:string){
    this.navigate(``)
   }
  navigate(route:string){
    this.router.navigate([route])
  }

  activeRoute(segment:string){
    return this.router.url.includes(segment)
  }


 filter(){

 }


 getOrganizations(){
  
 }
}
