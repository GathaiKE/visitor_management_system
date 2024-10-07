import { Component } from '@angular/core';
import { Visitor } from '../../../../interfaces/interfaces';
import { VisitorsService } from '../../../../services/visitors.service';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';
import { FormsModule, FormGroup } from '@angular/forms';
import { FormComponent } from '../../../../utilities/components/form/form.component';
import { PaginatorComponent } from '../../../../utilities/components/paginator/paginator.component';
import { SpinnerComponent } from '../../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-inactive',
  standalone: true,
  imports: [SpinnerComponent, PaginatorComponent, FormsModule,NgFor, FormComponent],
  templateUrl: './inactive.component.html',
  styleUrl: './inactive.component.css'
})
export class InactiveComponent {
  searchString:string = ''
  displayedData:Visitor[] = []
  unfilteredVisitors:Visitor[] = []
  showSpinner:boolean = false
  showPag:boolean = false
  visitors:Visitor[] = []
  pageSize:number = 10
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
  
  
  constructor(private visitorsService:VisitorsService, private router:Router){}
  
  ngOnInit(): void {
    this.fetchData()
  }
  
  fetchData(){
    this.showSpinner = true
    this.visitorsService.getVisitors().subscribe(res=>{
      if(res.data){
        this.visitors = res.data.filter(visitor=>visitor.blacklisted)
        this.unfilteredVisitors = res.data.filter(visitor=>visitor.blacklisted)
        this.totalPages = (Math.ceil((this.visitors.length)/this.pageSize))
        this.currentPage = 1
        this.showPag = this.totalPages > 1?true:false
        this.showSpinner = false
        this.updateDisplay()
      }
    })
   }
  
    filter(){
      let str: string = this.searchString.toLowerCase().trim()
      const data: Visitor[] = this.unfilteredVisitors.filter(i => {
        return (
          i.first_name?.toLowerCase().trim().includes(str) ||
          i.id_number?.toLowerCase().trim().includes(str) ||
          i.last_name?.toLowerCase().trim().includes(str) ||
          i.phone_number?.toLowerCase().trim().includes(str)
        )
      })
      this.visitors = data
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
      this.displayedData = this.visitors.slice(startIndex, endIndex);
    }
  
    onPageChange(page:number){
      this.currentPage = page
      this.updateDisplay()
    }
  
  
    closeForm(){
      this.showForm = false
    }
}
