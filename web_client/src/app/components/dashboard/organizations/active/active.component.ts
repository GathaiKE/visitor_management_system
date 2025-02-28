import { Component } from '@angular/core';
import { OrganizationsService } from '../../../../services/organizations.service';
import { Organization } from '../../../../interfaces/interfaces';
import { DatePipe, NgClass, NgFor } from '@angular/common';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-active',
  standalone: true,
  imports: [NgFor, PaginatorComponent, SpinnerComponent, FormsModule, DatePipe, NgClass],
  templateUrl: './active.component.html',
  styleUrl: './active.component.css'
})
export class ActiveComponent {

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

  constructor(private orgService:OrganizationsService){}


  fetchData(){
    this.showSpinner = true
    this.orgService.getOrganizations()
    this.orgService.orgnizations$.subscribe(res=>{
      this.organizations = res.filter(org=>org.status === true)
      this.unfilteredOrganizations = res.filter(org=>org.status === true)
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
