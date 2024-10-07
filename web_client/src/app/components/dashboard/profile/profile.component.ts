import { Component } from '@angular/core';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { Location, NgFor } from '@angular/common';
import { Admin } from '../../../interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { AdminsService } from '../../../services/admins.service';
import { SpinnerComponent } from '../../../utilities/components/spinner/spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent,NgFor, SpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  date = new Date()
  user:Admin | null = null
  showSpinner:boolean = false
  constructor(private activeRoute:ActivatedRoute, private adminService:AdminsService, private location:Location){}

  ngOnInit(): void {
    this.showSpinner = true
    const id:string = localStorage.getItem('user') as string
    this.adminService.getAdmin(id).subscribe(res=>{
      this.showSpinner = false
      if(res.data){
        this.user = res.data
      }
    })

  }


  goBack(){
    this.location.back()
  }


  updateUserInfo(){

  }
}
