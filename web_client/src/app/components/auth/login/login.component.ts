import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { FooterComponent } from '../../../utilities/components/footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  show:boolean;
  showPasswordCheck:boolean = false
  showText:'Show' | 'Hide'
  error!:string

  constructor(private fb:FormBuilder, private router:Router, private snackBar:MatSnackBar, private loginService:LoginService, private authService:AuthService){

    // Initialize show and checked variables 
    this.show = false
    this.showText = 'Show'
  }

 

  // Check the length of the password input field
  checkInputValue(value:string):boolean{
    return this.showPasswordCheck = value.length > 0
  }

  
  // Toggle password show or hide
  showPassword():void{

  }

  login(form:any) {
    if (form.valid) {
      const email = form.value.email
      const password = form.value.password

      this.loginService.login(email, password).subscribe(
        (response) => {
            const superAdmin:boolean = response.user.is_superuser
            const clientAdmin: boolean = response.user.is_admin
            const buildingAdmin: boolean = response.user.is_staff
            this.authService.currentUserSub.next(response.user)
            
            // switch (true) {
            //   case (superAdmin):
            //     this.router.navigate(['organizations'])
            //     break;
            //   case (clientAdmin):
            //     this.router.navigate(['admins']);
            //     break;
            //   case (buildingAdmin):
            //     this.router.navigate(['visits'])
            //     break;
            //   default:
            //     this.router.navigate(['visits'])
            //     break;
            // }


            this.router.navigate(['admins']);
            
            this.snackBar.open('Login Successfull', 'Close', {
              duration: 2500,
            });
          
        },
        (error) => {
          this.snackBar.open(`${error.error.non_field_errors}`, 'Close', {
            duration: 4000,
          })
        })
      } else{
        this.snackBar.open('Provide valid email and Password', 'close',{
          duration:2000
        })
      }
  }
}
