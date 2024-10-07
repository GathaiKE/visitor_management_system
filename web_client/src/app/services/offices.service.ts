import { Injectable, Signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, map, of } from 'rxjs';
import { Office, Floor, NewOffice } from '../interfaces/interfaces';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Response } from '../utilities/utilities';

@Injectable({
  providedIn: 'root'
})
export class OfficesService {

  private floorIdSub: BehaviorSubject<string> = new BehaviorSubject('')
  private floorId$:Observable<string> = this.floorIdSub.asObservable()
  floorId!:Signal<string>
  apiUrl:string = environment.USERS_BASE_URL as string
  token:string = localStorage.getItem('authToken') as string

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Token ${this.token}`
  });

 httpOptions = {
    headers: this.headers
  };

  constructor(private http:HttpClient) {
    this.floorId$.subscribe(id=>this.floorId = computed(()=>id))
   }

  updateFloorId(id:string){
    this.floorIdSub.next(id)
  }

  getOffices(id?:string):Subscription{
    return this.http.get<Office[]>(`${this.apiUrl}/office`, this.httpOptions).pipe(
      map(offices=>{
        offices = offices.filter(office=>office.floor.building.id === id)
        return ({data:offices} as Response<Office[]>)
      }),
      catchError((err:HttpErrorResponse)=>of({data:[],error:this.httpErrorFormatter(err)} as Response<Office[]>))
    ).subscribe(res=>{
      this.officeSub.next(res.data)
    })
  }

  addOffice(office:NewOffice, building?:string): Observable<Office> {
    return this.http.post<Office>(`${this.apiUrl}/office/`, office ,this.httpOptions).pipe(
      map(res=>{
        this.getOffices(building)
        return res
      })
    )
  }

  deleteOffice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/office/${id}/`,this.httpOptions);
  }

  updateOffice(name:string, id:string):Observable<Office>{
    const updatedOffice = {
      office_name:name
    }

    return this.http.put<Office>(`${this.apiUrl}/office/${id}/`, updatedOffice, this.httpOptions)
  }

  private httpErrorFormatter(err: HttpErrorResponse): string {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      errorMessage = `Server Error ${err.status} : ${err.message}`
    }
    return errorMessage;
  }

  private officeSub:BehaviorSubject<Office[]> = new BehaviorSubject<Office[]>([])
  offices$:Observable<Office[]> = this.officeSub.asObservable()
}
