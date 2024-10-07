import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
  animations: [
    trigger('popUpAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.5)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in')
      ])
    ])
  ]
})

export class SidenavComponent {
  
  constructor(private router:Router, private authService:AuthService){}
  
//  isBuildingAdmin:boolean = this.authService.isBuildingAdmin()
 //  isClientAdmin:boolean = this.authService.isClientAdmin()
 //  isSuperAdmin:boolean = this.authService.isSuperAdmin()
 //  isAssistantSuperuser:boolean = this.authService.isAssistantSuperAdmin()

isBuildingAdmin:boolean = true
  isClientAdmin:boolean = true
  isSuperAdmin:boolean = true
  isAssistantSuperuser:boolean = true


  isActive(route: string) {
    return this.router.isActive(route, true);
  }

  navigate(route:string){
    this.router.navigate([route])
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
