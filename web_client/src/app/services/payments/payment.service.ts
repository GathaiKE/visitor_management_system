import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NewPayment, Payment } from '../../interfaces/interfaces';
import { catchError, map, Observable, of } from 'rxjs';
import { Response } from '../../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  token:string = localStorage.getItem('authToken') as string
  private apiUrl: string = environment.USERS_BASE_URL;
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Token ${this.token}`
  });

 httpOptions = {
    headers: this.headers
  };
  constructor(private http:HttpClient) { }

  getPayments(id?:string):Observable<Response<Payment[]>>{
    return this.http.get<Payment[]>(`${this.apiUrl}/payment`, this.httpOptions).pipe(
      map(res=>{
        if(id){
          res = res.filter(rec=>rec.organization.id === id)
        }
        return ({data:res} as Response<Payment[]>)
      }),
      catchError((err:HttpErrorResponse)=> of({data:[], error:err.error} as Response<Payment[]>))
    )
  }

  makePayment(data:NewPayment):Observable<any>{
    return this.http.post(`${this.apiUrl}/payment`, data, this.httpOptions)
  }
}
