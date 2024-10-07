import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { Building, Organization, Traffic, Visit } from '../../../interfaces/interfaces';
import { VisitorsService } from '../../../services/visitors.service';
import { Router, RouterOutlet } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { PaginatorComponent } from '../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';
import { OrganizationsService } from '../../../services/organizations.service';
import { BuildingsService } from '../../../services/buildings.service';
Chart.register(...registerables)


@Component({
  selector: 'app-visits',
  standalone: true,
  providers:[provideNativeDateAdapter()],
  imports: [NgClass, NgFor, DatePipe, HeaderComponent, SidenavComponent, FormsModule, PaginatorComponent, SpinnerComponent],
  templateUrl: './visits.component.html',
  styleUrl: './visits.component.css'
})

export class VisitsComponent implements OnInit{
  today = new Date()
  buildings:Building[]=[]
  organizations:Organization[] = []
  unfilteredVisits:Visit[] = []
  visits:Visit[] = []
  dateFilter:string = ''
  displayDatePretext: string = 'Today'

  labels: string[] = []
  data:number[] = []
  showSpinner:boolean = false
  showPag:boolean = false
  currentPage:number = 1
  pageSize:number = 1
  displayedData:Visit[] = []
  exportData:Visit[] = []
  showGraph:boolean = false


  ngOnInit(): void {
    this.showSpinner = true
    this.visitorService.getTraffic().map(rec=>{
        this.labels.push(rec.hour)
        this.data.push(rec.visits)
        this.renderChart(this.labels, this.data)
      })


      this.organizationService.getOrganizations()
      this.organizationService.orgnizations$.subscribe(organizations=>this.organizations = organizations)
      this.buildingService.getBuildings()
      this.buildingService.buildings$.subscribe(buildings=>this.buildings = buildings)

      this.visitorService.visits$.subscribe(res=>{
        this.visits = res
        this.showGraph = res.length > 0?true:false
        this.unfilteredVisits = res
        const totalPages = (Math.ceil((this.visits.length)/this.pageSize))
        this.currentPage = 1
        this.showPag = totalPages > 1?true:false
        this.showSpinner = false
        this.updateDisplay()
      })

  }

  constructor(private visitorService:VisitorsService, private router:Router, private organizationService:OrganizationsService, private buildingService:BuildingsService){}

  navigate(route:string){
    this.router.navigate([route])
  }
  
  activeRoute(segment:string){
   return this.router.url.includes(segment)
 }

 filterByDate(event: Event): void {
  const value: string = (event.target as HTMLInputElement).value
  let date = new Date(value);
  let filteredRecords = this.unfilteredVisits.filter(record => {
    let recordDate = new Date(record.checkin_time);
    return recordDate.toDateString() === date.toDateString();
  });
  this.visits = filteredRecords
  this.exportData = filteredRecords.slice()
  this.today = date
  this.displayDatePretext = date === new Date() ? 'Today' : 'Date'
  this.updateDisplay()
}

filterByBuilding(event: Event | null): void {
  const value: string = (event?.target as HTMLSelectElement).value
  if (value) {
    const data: Visit[] = this.unfilteredVisits.filter(i => i.building?.id === value.toLowerCase().trim())
    this.visits = data
    this.exportData = data
    this.updateDisplay()
  } else {
    const data: Visit[] = this.unfilteredVisits
    this.visits = data
    this.exportData = data
    this.updateDisplay()
  }
}

filterByOrganization(event: Event | null): void {
  const value: string = (event?.target as HTMLSelectElement).value
  if (value) {
    const data: Visit[] = this.unfilteredVisits.filter(i => i.building.organization?.id === value.toLowerCase().trim())
    this.visits = data
    this.exportData = data
    this.updateDisplay()
  } else {
    const data: Visit[] = this.unfilteredVisits
    this.visits = data
    this.exportData = data
    this.updateDisplay()
  }
}

filter(){

}

searchString:string = ''

renderChart(labels:any, data:any){
  const chart = new Chart('barchart', {
    type:'bar',
    data:{
      labels:labels,
      datasets:[
        {
          label:'Visits',
          data:data,
          backgroundColor:'rgb(1, 0, 138)',
          barPercentage: 0.4
        }
      ]
    },
    options:{
      maintainAspectRatio:false,
      scales:{
        y:{
          beginAtZero:true
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 90 
          }
        }
      }
    }
  })
}

details(id:string){

}

updateDisplay() {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.displayedData = this.visits.slice(startIndex, endIndex);
}

onPageChange(page:number){
  this.currentPage = page
  this.updateDisplay()
}
}