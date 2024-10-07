import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  showMenu:boolean = false
  
  constructor(private router:Router, private authService:AuthService){}
  
  isBuildingAdmin:boolean = this.authService.isBuildingAdmin()
  isClientAdmin:boolean = this.authService.isClientAdmin()
  isSuperAdmin:boolean = this.authService.isSuperAdmin()
  isAssistantSuperuser:boolean = this.authService.isAssistantSuperAdmin()

  isActive(route: string) {
    return this.router.url.includes(route);
  }

 

  navigate(route:string){
    this.router.navigate([route])
  }

  openToggle(){
    this.showMenu = !this.showMenu
  }
  
  activeRoute(segment:string){
   return this.router.url.includes(segment)
 }
 
  logOut(){
    localStorage.clear()
    this.updateVariables()
    this.navigate('')
  }

  updateVariables(){
    this.authService.tokenSub.next(null)
    this.authService.currentUserSub.next(null)
  }


}
