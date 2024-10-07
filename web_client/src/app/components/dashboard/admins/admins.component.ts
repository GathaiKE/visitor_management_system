import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { FooterComponent } from '../../../utilities/components/footer/footer.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { AdminsService } from '../../../services/admins.service';
import { Admin } from '../../../interfaces/interfaces';
@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [NgClass, HeaderComponent, FooterComponent, SidenavComponent, RouterOutlet],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.css'
})
export class AdminsComponent implements OnInit{
  showPath:boolean = false
  admins:Admin[] = []
  building:number = 0
  organization:number = 0
  assistant:number = 0

  constructor(private router:Router, private adminsService:AdminsService){}

  ngOnInit(): void {
    this.navigate('admins/assistant/all')
    this.fetchData()
  }

  navigate(route:string){
    this.router.navigate([route])
  }
  
  activeRoute(route:string){
   return this.router.isActive(route, true)
 }

 fetchData(){
  this.adminsService.getAdmins()
  this.adminsService.admins$.subscribe(res=>{
    if(res){
      this.admins = res
      this.building = (res).filter(i=>i.is_staff).length
      this.organization = (res).filter(i=>i.is_admin).length
      this.assistant = (res).filter(i=>i.is_assistant_superuser).length
    }
  })
 }
}
