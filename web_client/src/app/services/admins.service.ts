import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Admin, NewAdmin, NewAdminFormData } from '../interfaces/interfaces';
import { Response } from '../utilities/utilities'
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {
  user!:Admin
  token:string = localStorage.getItem('authToken') as string
  private apiUrl: string = environment.USERS_BASE_URL;
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Token ${this.token}`
  });

 httpOptions = {
    headers: this.headers
  };

  constructor(private http:HttpClient, private authService:AuthService) {
    this.authService.currentUser$.subscribe(res=>{
      if(res){
        this.user = res
      }
    })
  }

  registerAdmin(newAdmin:NewAdmin):Observable<Admin>{
    // let phone:string = (formData.phoneNumber)
    // let phone_number_chars = phone.slice(-9)
    // let final_phone_number:string = `254`+phone_number_chars
    // let payload:NewAdmin;
    // switch (adminType) {
    //   case 'client':
    //     payload = {
    //       first_name:formData.firstName,
    //       last_name:formData.lastName,
    //       email:formData.email,
    //       password:formData.password,
    //       phone_number:final_phone_number,
    //       username:formData.username,
    //       building:formData.building,
    //       organization:formData.organization,
    //       is_active:true,
    //       is_admin:true,
    //       is_staff:false,
    //       is_superuser:false
    //     };
    //     break;
    //   case 'assistant':
    //     payload = {
    //       first_name:formData.firstName,
    //       last_name:formData.lastName,
    //       email:formData.email,
    //       password:formData.password,
    //       phone_number:final_phone_number,
    //       username:formData.username,
    //       building:formData.building,
    //       organization:formData.organization,
    //       is_active:true,
    //       is_admin:false,
    //       is_staff:false,
    //       is_superuser:true
    //     }
    //     break;
    //   case 'building':
    //     payload = {
    //       first_name:formData.firstName,
    //       last_name:formData.lastName,
    //       email:formData.email,
    //       password:formData.password,
    //       phone_number:final_phone_number,
    //       username:formData.username,
    //       building:formData.building,
    //       organization:formData.organization,
    //       is_active:true,
    //       is_admin:false,
    //       is_staff:true,
    //       is_superuser:false
    //     }
    //   break;
    //   default:
    //     payload = {
    //       first_name:formData.firstName,
    //       last_name:formData.lastName,
    //       email:formData.email,
    //       password:formData.password,
    //       phone_number:final_phone_number,
    //       username:formData.username,
    //       building:formData.building,
    //       organization:formData.organization,
    //       is_active:false,
    //       is_admin:false,
    //       is_staff:false,
    //       is_superuser:false
    //     }
    //     break;
    // }

    // console.log('New Admin', payload);
    
  return this.http.post<Admin>(`${this.apiUrl}/user/`,newAdmin,this.httpOptions).pipe(
    map(res=>{
      this.getAdmins()
      return res
    })
  )
  }

  // Fetch Admins
  getAdmins():Subscription{
    return this.http.get<Admin[]>(`${this.apiUrl}/user`,).pipe(
      map((admins)=>{
        let result = []
        switch(true){
          case this.user.is_assistant_superuser || this.user.is_superuser:
            result = admins
            break;
          case this.user.is_admin:
            result = admins.filter(item=>item.organization?.id === this.user.organization?.id)
            break;
          case this.user.is_staff:
            result = admins.filter(item=>item.building?.id === this.user.building?.id)
            break;
          default:
            result = admins.filter(item=>item.building?.id === this.user.building?.id)
            break;
        }
            return ({data:result} as Response<Admin[]>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:[],error:this.httpErrorFormatter(err)} as Response<Admin[]>))
    ).subscribe(res=>{
      if(res.data){
        this.adminSub.next(res.data)
      }
    })
  }

  getAdmin(id:string):Observable<Response<Admin>>{
    return this.http.get<Admin>(`${this.apiUrl}/user/${id}/`,this.httpOptions).pipe(
      map((admin)=>({data:admin} as Response<Admin>)),
      catchError((err:HttpErrorResponse)=>of({data:{},error:this.httpErrorFormatter(err)} as Response<Admin>))
    )
  }

  // Delete Admin
  deleteAdmin(id:string):Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/user/${id}`,this.httpOptions)
  }

  // Update Admin
  updateAdmin(adminData: Admin): Observable<any> {
    const url = `${this.apiUrl}/user/${adminData.id}/`;
    return this.http.put(url, adminData,this.httpOptions);
  }

  private httpErrorFormatter(err: HttpErrorResponse): string {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server Error ${err.status} : ${err.message}`
    }
    return errorMessage;
  }

  private adminSub:BehaviorSubject<Admin[]> = new BehaviorSubject<Admin[]>([])
  admins$:Observable<Admin[]> = this.adminSub.asObservable()
}
