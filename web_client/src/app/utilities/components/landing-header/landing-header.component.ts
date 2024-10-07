import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.css'
})
export class LandingHeaderComponent {
  @Output() contactValue = new EventEmitter<any>()
   showMenu: boolean = false;
  constructor(private router:Router) {}


  openToggle() {
    this.showMenu = !this.showMenu;
  }

  emitContact() {
    this.contactValue.emit();
  }

  logIn(){
    this.router.navigate(['login'])
  }

  navigate(route:string){
    this.router.navigate([route])
  }
}
