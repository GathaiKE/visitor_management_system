import { Component, OnInit } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { HeaderComponent } from "../../../utilities/components/header/header.component";
import { SidenavComponent } from "../../../utilities/components/sidenav/sidenav.component";
import { NgClass } from "@angular/common";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DualRowFormComponent } from "../../../utilities/components/dual-row-form/dual-row-form.component";
import { Admin, NewBuilding, Organization } from "../../../interfaces/interfaces";
import { OrganizationsService } from "../../../services/organizations.service";
import { AdminsService } from "../../../services/admins.service";
import { BuildingsService } from "../../../services/buildings.service";
import { MatSnackBar } from "@angular/material/snack-bar";



@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidenavComponent, NgClass, DualRowFormComponent],
  templateUrl: './buildings.component.html',
  styleUrl: './buildings.component.css'
})
export class BuildingsComponent implements OnInit{
  organizations:Organization[] = []
  user: Admin | null = null
   showForm:boolean = false
  formConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    name:{type:'text', label:'Name'},
    floors:{type:'number', label:'No of Floors'},
    location:{type:'text', label:'Location'},
    organization:{type:'select', label:'Organization'},
    status:{type:'checkbox', label:'Status'},
  }
  form!:FormGroup<any>
  
  constructor(
    private router:Router,
    private fb:FormBuilder,
    private orgainizationService:OrganizationsService,
    private adminService:AdminsService,
    private buildingService:BuildingsService,
    private snackBar:MatSnackBar
  ){}

  ngOnInit(): void {
    this.navigate('buildings/all')
    this.initForm()
    this.fetchData()
  }
  
  fetchData(){
    this.orgainizationService.getOrganizations()
    this.orgainizationService.orgnizations$.subscribe(res=>{

      if(res){
        this.organizations = res
      }
    })
    this.adminService.getAdmin(localStorage.getItem('user') as string).subscribe(res=>this.user = res.data)
  }
  initForm(){
    this.form = this.fb.group({
      name:['', Validators.required],
      floors:[1, Validators.required],
      location:['', [Validators.required, Validators.email]],
      organization:['', Validators.required],
      status:[true, Validators.required]
    })
  }

  openForm(){
    this.showForm = true
   }
   register(formData:any){
    let newBuilding:NewBuilding = {
      building_name:formData.name,
      floors:formData.floors,
      location:formData.location,
      organization:formData.organization?formData.organization:this.user?.organization?.id,
      status:formData.status
    }
    

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
  
   closeForm(){
    this.showForm = false
   }

   navigate(route:string){
    this.router.navigate([route])
  }


  activeRoute(segment:string){
    return this.router.url.includes(segment)
  }


}
