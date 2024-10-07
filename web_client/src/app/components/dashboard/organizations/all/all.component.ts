import { Component, OnInit } from '@angular/core';
import { Organization } from '../../../../interfaces/interfaces';
import { DatePipe, NgClass, NgFor } from '@angular/common';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { OrganizationsService } from '../../../../services/organizations.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all',
  standalone: true,
  imports: [NgFor, PaginatorComponent, SpinnerComponent, DatePipe, FormsModule,NgClass ],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit{

  organizations:Organization[] = []
  unfilteredOrganizations:Organization[] = []
  displayedData:Organization[] = []
  showSpinner:boolean = false
  showPag:boolean = false
  searchString:string = ''

  currentPage:number = 1
  totalPages:number = 1
  pageSize:number = 10

  ngOnInit(): void {
    this.fetchData()
  }

  constructor(private orgService:OrganizationsService, private router:Router){}


  fetchData(){
    this.showSpinner = true
    this.orgService.getOrganizations()
    this.orgService.orgnizations$.subscribe(res=>{
      this.organizations = res
      this.unfilteredOrganizations = res
      this.showSpinner = false
      this.updateDisplay()
    })
  }

  filter(){
    const txt:string = this.searchString.trim().toLowerCase()
    this.organizations = this.unfilteredOrganizations.filter(org=>(
      org.organization_name.trim().toLowerCase().includes(txt) ||
      org.organization_number?.trim().toLowerCase().includes(txt) ||
      org.address?.trim().toLowerCase().includes(txt) ||
      org.email?.trim().toLowerCase().includes(txt) ||
      org.phone_number?.trim().toLowerCase().includes(txt)
    ))
    this.updateDisplay()
  }

  getDetails(id:string){
    this.router.navigate([`organization-detail/${id}`])
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.organizations.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }


}
