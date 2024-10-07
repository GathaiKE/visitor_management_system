import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { Organization, Payment, PaymentMethod } from '../../../interfaces/interfaces';
import { PaymentService } from '../../../services/payments/payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationsService } from '../../../services/organizations.service';
import { DualRowFormComponent } from '../../../utilities/components/dual-row-form/dual-row-form.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, DualRowFormComponent],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit{
  paymentMethods:PaymentMethod[] = [
    {id:1, type:"Cash"},
    {id:2, type:"Mpesa"},
    {id:3, type:"Standard Chartered"}
  ]
  organizations:Organization[] = []
  payments:Payment[] = []
  unfilteredPayments:Payment[] = []
  displayedData:Payment[] = []
  currentPage:number = 1
  pageSize:number = 10
  totalPages:number = 1
  showSpinner: boolean = false
  showPag: boolean = false
  showForm: boolean = false
  formConfig:{[key:string]:{label?:string, type:string, options?:any[]}}={
    transactionNo:{type:'text', label:'Transaction Number'},
    receiptNo:{type:'text', label:'Receipt Numberl'},
    amount:{type:'number', label:'Amount'},
    organization:{type:'select', label:'Organization'},
    paymentMethod:{type:'select', label:'Payment Method'},
  }
  form!:FormGroup<any>

constructor(
  private paymentService:PaymentService, 
  private fb:FormBuilder, 
  private organizationService:OrganizationsService

){}

ngOnInit(): void {
  this.fetchData()
  this.initForm()
}

initForm(){
  this.form = this.fb.group({
    transactionNo:['', Validators.required],
    receiptNo:['', Validators.required],
    amount:[0.00, Validators.required],
    organization:['', Validators.required],
    paymentMethod:['', Validators.required],
  })
}

  fetchData(){
    this.showSpinner = true
    this.paymentService.getPayments().subscribe(res=>{
      console.log(res)
      if(res.data){
        this.payments = res.data
        this.unfilteredPayments = res.data
        this.showSpinner = false
        this.updateDisplay()
      }
    })
    this.organizationService.getOrganizations()
    this.organizationService.orgnizations$.subscribe(res=>{
      if(res){
        this.organizations =  res
      }
    })
  }
  
  openForm(){
    this.showForm = true
   }
   register(formData:any){
      console.log(formData)
   }
  
   closeForm(){
    this.showForm = false
   }


  updateDisplay() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.payments.slice(startIndex, endIndex);
  }

  onPageChange(page:number){
    this.currentPage = page
    this.updateDisplay()
  }

}
