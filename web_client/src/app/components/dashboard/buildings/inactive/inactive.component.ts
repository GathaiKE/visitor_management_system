import { NgFor, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Building } from '../../../../interfaces/interfaces';
import { BuildingsService } from '../../../../services/buildings.service';
import { FormComponent } from '../../../../utilities/components/form/form.component';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inactive',
  standalone: true,
  imports: [SpinnerComponent, PaginatorComponent, NgFor, FormsModule, NgClass, FormComponent],
  templateUrl: './inactive.component.html',
  styleUrl: './inactive.component.css'
})
export class InactiveComponent {
  buildings:Building[] = []
  unfilteredbuildings:Building[] = []
  displayedData:Building[] = []
  showSpinner:boolean = false
  showPag:boolean = false
  searchString:string = ''

  currentPage:number = 1
  totalPages:number = 1
  pageSize:number = 10

  ngOnInit(): void {
    this.fetchData()
  }

  constructor(private buildService:BuildingsService, private router:Router){}


  fetchData(){
    this.showSpinner = true
    this.buildService.getBuildings()
    this.buildService.buildings$.subscribe(res=>{
      if(res){
        this.buildings = []
        this.unfilteredbuildings = []
        this.showSpinner = false
        this.updateDisplay()
      }
    })
  }

  filter(){
    const txt:string = this.searchString.trim().toLowerCase()
    this.buildings = this.unfilteredbuildings.filter(building=>(
      building.building_name.trim().toLowerCase().includes(txt) ||
      building.organization?.organization_name?.trim().toLowerCase().includes(txt) ||
      building.location?.trim().toLowerCase().includes(txt)
    ))
    this.updateDisplay()
  }

  details(id:string){
    this.router.navigate([`building-detail/${id}`])
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.buildings.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }

}
