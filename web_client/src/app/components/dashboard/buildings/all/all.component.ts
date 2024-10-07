import { Component, OnInit } from '@angular/core';
import { BuildingsService } from '../../../../services/buildings.service';
import { Building } from '../../../../interfaces/interfaces';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormComponent } from '../../../../utilities/components/form/form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all',
  standalone: true,
  imports: [SpinnerComponent, PaginatorComponent, NgFor, FormsModule, NgClass, FormComponent ],
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})
export class AllComponent implements OnInit{

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
        this.buildings = res
        this.unfilteredbuildings = res
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
