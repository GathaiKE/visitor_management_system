import { Component } from '@angular/core';
import { Admin } from '../../../../../interfaces/interfaces';
import { Router } from '@angular/router';
import { AdminsService } from '../../../../../services/admins.service';
import { FormGroup, FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { FormComponent } from '../../../../../utilities/components/form/form.component';
import { PaginatorComponent } from '../../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-active',
  standalone: true,
  imports: [FormsModule, NgFor, FormComponent, SpinnerComponent, PaginatorComponent],
  templateUrl: './active.component.html',
  styleUrl: './active.component.css'
})
export class ActiveComponent {
  searchString:string = ''
displayedData:Admin[] = []
unfilteredAdmins:Admin[] = []
showSpinner:boolean = false
showPag:boolean = false
admins:Admin[] = []
pageSize:number = 5
totalPages:number = 1
currentPage:number = 1
showForm:boolean = false
form!:FormGroup<any>
formConfig = {

}

submit:string = 'Submit'
size:string = 'fit'
title:string = 'Form'
abort:string = 'Close'


constructor(private adminsService:AdminsService, private router:Router){}

ngOnInit(): void {
  this.fetchData()
}

fetchData(){
  this.showSpinner = true
  this.adminsService.getAdmins()
  this.adminsService.admins$.subscribe(res=>{
    if(res){
      this.admins = res.filter(admin=>admin.is_staff && admin.is_active)
      this.unfilteredAdmins = res.filter(admin=>admin.is_staff && admin.is_active)
      this.totalPages = (Math.ceil((this.admins.length)/this.pageSize))
      this.currentPage = 1
      this.showPag = this.totalPages > 1?true:false
      this.showSpinner = false
      this.updateDisplay()
    }
  })
 }

  filter(){
    let str: string = this.searchString.toLowerCase().trim()
    const data: Admin[] = this.unfilteredAdmins.filter(i => {
      return (
        i.first_name?.toLowerCase().trim().includes(str) ||
        i.middle_name?.toLowerCase().trim().includes(str) ||
        i.last_name?.toLowerCase().trim().includes(str) ||
        i.email?.toLowerCase().trim().includes(str) ||
        i.phone_number?.toLowerCase().trim().includes(str) ||
        i.organization?.organization_name?.toLowerCase().trim().includes(str) ||
        i?.building?.building_name.toLowerCase().trim().includes(str)
      )
    })
    this.admins = data
    this.updateDisplay()
  }

  register(){

  }

  details(id:string){
    this.router.navigate([`detail/${id}`])
  }

  getFormValue(value:any){}

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.admins.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }


  closeForm(){
    this.showForm = false
  }
}
