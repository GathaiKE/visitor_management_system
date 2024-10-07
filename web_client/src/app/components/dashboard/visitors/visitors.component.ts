import { Component, OnInit } from '@angular/core';
import { Visitor } from '../../../interfaces/interfaces';
import { VisitorsService } from '../../../services/visitors.service';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { HeaderComponent } from '../../../utilities/components/header/header.component';


@Component({
  selector: 'app-visitors',
  standalone: true,
  imports: [NgClass, RouterOutlet, SidenavComponent, HeaderComponent],
  templateUrl: './visitors.component.html',
  styleUrl: './visitors.component.css'
})
export class VisitorsComponent implements OnInit{

  visitors:Visitor[] = []
  unfilteredvisitors:Visitor[] = []
  displayedData:Visitor[] = []
  showSpinner:boolean = false
  showPag:boolean = false
  searchString:string = ''

  currentPage:number = 1
  totalPages:number = 1
  pageSize:number = 10

  ngOnInit(): void {
    this.fetchData()
  }

  constructor(private visitorService:VisitorsService, private router:Router){}


  fetchData(){
    this.showSpinner = true
    this.visitorService.getVisitors().subscribe(res=>{
      if(res.data){
        this.visitors = res.data
        this.unfilteredvisitors = res.data
        this.showSpinner = false
        this.updateDisplay()
      }
    })
    this.navigate('visitors/all')
  }

  filter(){
    const txt:string = this.searchString.trim().toLowerCase()
    this.visitors = this.unfilteredvisitors.filter(visitor=>(
      visitor.first_name.trim().toLowerCase().includes(txt) ||
      visitor.last_name.trim().toLowerCase().includes(txt) ||
      visitor.id_number.trim().toLowerCase().includes(txt) ||
      visitor.phone_number.trim().toLowerCase().includes(txt)
    ))
    this.updateDisplay()
  }

  details(id:string){
    // this.router.navigate([`visitor-detail/${id}`])
  }

  openForm(){

  }

  activeRoute(segment:string){
    return this.router.url.includes(segment)
  }

  navigate(route:string){
    this.router.navigate([route])
  }

  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.visitors.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }
}
