import { Component } from '@angular/core';
import { BuildingsService } from '../../../../services/buildings.service';
import { ActivatedRoute } from '@angular/router';
import { Admin, Building, Floor, NewBuilding, NewOffice, Office, Organization } from '../../../../interfaces/interfaces';
import { DatePipe, Location, NgFor } from '@angular/common';
import { HeaderComponent } from '../../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../../utilities/components/sidenav/sidenav.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';
import { OfficesService } from '../../../../services/offices.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FloorsService } from '../../../../services/floors.service';
import { FormComponent } from '../../../../utilities/components/form/form.component';
import { DualRowFormComponent } from '../../../../utilities/components/dual-row-form/dual-row-form.component';
import { OrganizationsService } from '../../../../services/organizations.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminsService } from '../../../../services/admins.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, DatePipe, SpinnerComponent, NgFor, FormComponent, DualRowFormComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {

  date = new Date()
  building!:Building
  buildingId:string = ''
  offices:Office[] = []
  unfilteredOffices:Office[] = []
  displayedData:Office[] = []
  floors:Floor[] = []
  showSpinner:boolean = false
  showForm:boolean = false
  formConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    name:{type:'text', label:'Name'},
    floor:{type:'select', label:'Floor'}
  }
  officeForm!:FormGroup<any>
  updateBuildingForm!: FormGroup<any>
  showUpdateBuildingForm: boolean = false
  updateBuildingFormConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    name:{type:'text', label:'Name'},
    floors:{type:'number', label:'No of Floors'},
    location:{type:'text', label:'Location'},
    organization:{type:'select', label:'Organization'},
    status:{type:'checkbox', label:'Status'},
  }
  showUpdateOfficeForm:boolean = false

  user:Admin | null = null
  showPag:boolean = false
  totalPages:number = 1
  currentPage:number = 1
  pageSize:number = 5

  organizations:Organization[] = []

  constructor(
    private activeRoute:ActivatedRoute, 
    private buildingService:BuildingsService,
    private location:Location, 
    private officeService:OfficesService,
    private floorService:FloorsService,
    private fb:FormBuilder,
    private organizationService:OrganizationsService,
    private snackBar:MatSnackBar,
  private adminService:AdminsService
  ){}

  ngOnInit(): void {
    this.showSpinner = true
    this.activeRoute.params.subscribe(params=>{
      const id = params['id']
      this.buildingId = id
      this.getBuilding(id)
      this.getOffices(id)
      this.getFloors(id)
      this.getOrganizations()
      this.initForm()
    })
    this.adminService.getAdmin(localStorage.getItem('user') as string).subscribe(res=>{
      this.user = res.data
    })

  }

initForm(){
  this.officeForm = this.fb.group({
    name:['', Validators.required],
    floor:['', Validators.required]
  })

}
  getBuilding(id:string){
    this.buildingService.getBuilding(id).subscribe(res=>{
      this.showSpinner = false
      if(res.data){
        this.building = res.data

        this.updateBuildingForm = this.fb.group({
          name:[this.building.building_name, Validators.required],
          floors:[this.building.floors, Validators.required],
          location:[this.building.location, [Validators.required, Validators.email]],
          organization:['', Validators.required],
          status:[this.building.status, Validators.required]
        })
      }
    })
  }

  getOffices(id:string){
    this.officeService.getOffices(id)
    this.officeService.offices$.subscribe(res=>{
      this.offices = res
      this.unfilteredOffices = res
      this.totalPages = (Math.ceil((this.offices.length)/this.pageSize))
      this.currentPage = 1
      this.showPag = this.totalPages > 1?true:false
      this.totalPages = 1
      this.currentPage = 1
      this.updateDisplay()
    })
  }

  getFloors(id:string){
    this.floorService.getFloors(id).subscribe(res=>{
      if(res.data){
        this.floors = res.data
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

  openOfficeRegisterForm(){
    this.showForm = true
   }

   closeForm(){
    this.showForm = false
   }

   registerOffice(formData:any){
      let newOffice:NewOffice = {
        floor:formData.floor,
        office_name:formData.name
      }
      
      this.officeService.addOffice(newOffice, this.building?.id).subscribe(res=>{
        if(res.id){
          this.snackBar.open('Office registered successfully', 'close',{
            duration:2000
          })
        } else{
          this.snackBar.open('Failed! Please check your internet connection and try again', 'close',{
            duration:3000
          })
        }
      })
   }
  
   closeUpdateBuildingForm(){
    this.showUpdateBuildingForm = false
   }
   openUpdateBuildingForm(){
    this.showUpdateBuildingForm = true
   }

   updateBuilding(formData:any){
    let updatedBuilding:Building = {
      building_name:formData.name,
      floors:formData.floors,
      location:formData.location,
      organization:formData.organization?formData.organization:this.user?.organization?.id,
      status:formData.status,
      created_at:this.building.created_at,
      deleted_at:this.building.deleted_at,
      updated_at:this.building.updated_at,
      id:this.building.id
    }

    this.buildingService.updateBuilding(updatedBuilding).subscribe(res=>{
      if(res.id){
        this.getBuilding(this.buildingId)
        this.snackBar.open('Building Updated successfully', 'close',{
          duration:2000
        })
      } else{
        this.snackBar.open('Failed! Please check your internet connection and try again', 'close',{
          duration:3000
        })
      }
    })
   }

   openUpdateOfficeForm(){
    this.showUpdateOfficeForm = false
   } 

   closeUpdateOfficeForm(){
    this.showUpdateOfficeForm = false
   }

  editOffice(office:Office){

  }


  goBack(){
    this.location.back()
  }




  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.offices.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }


  

  
}
