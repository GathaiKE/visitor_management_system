import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FooterComponent } from '../../utilities/components/footer/footer.component';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { DemoFormComponent } from './demo-form/demo-form.component';
import { LandingHeaderComponent } from '../../utilities/components/landing-header/landing-header.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FooterComponent, CommonModule, LandingHeaderComponent, FormsModule, DemoFormComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit{
  showForm:boolean = false
  formConfig:{[key:string]:{type:string, label:string, options?:any}} = {
    name:{type:'text', label:'Name'},
    title:{type:'email', label:'Email'},
    message:{type:'text', label:'Phone Number'}
  }
  bookDemoForm!:FormGroup<any>
  
  headerStyle={
    "background-color":"transparent"
  }
  year!:any

  constructor(private router:Router, private elementRef:ElementRef, private fb:FormBuilder){}

  ngOnInit(): void {
    this.year = new Date().getFullYear()
    this.initForm()
  }

  initForm(){
    this.bookDemoForm = this.fb.group({
      name:[''],
      title:[''],
      message:['']
    })
  }

  @HostListener('window:scroll',['$event'])
  onWindowScroll(event:Event) {
    const totalPageHeight = document.body.clientHeight;
    const scrolledHeight = window.scrollY; 
    if (scrolledHeight < totalPageHeight) {
      const opacity = scrolledHeight / totalPageHeight;
      this.headerStyle['background-color'] = `rgba(255,255,255,1)`;
    } else {
      this.headerStyle['background-color'] = 'rgba(231, 236, 255,1)'; 
    }
  }


  navigate(){
    this.router.navigate(['login'])
  }
  

  sendMessage(form:any){
    if(form.valid){
      console.log("Form is valid", form.value);
    }
  }

  scrollTo(target:string) {
    const section = this.elementRef.nativeElement.querySelector('#'+ target);
    if (section) {
      this.smoothScroll(section);
    }
  }

  navTo(){
    this.scrollTo('contact')
  }

  private smoothScroll(target: HTMLElement) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  open(){
    this.showForm = true
  }

  close(){
    this.showForm = false
  }

  getFormValue(event:any){
    console.log(event)
  }


}
