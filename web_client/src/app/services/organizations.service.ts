import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, catchError, map, of, tap } from 'rxjs';
import { NewOrganization, Organization } from '../interfaces/interfaces';
import { Response } from '../utilities/utilities'

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {
  
  token:string = localStorage.getItem('authToken') as string
  private apiUrl: string = environment.USERS_BASE_URL;
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Token ${this.token}`
  });

  // Create the configuration object
 httpOptions = {
    headers: this.headers
  };

  constructor(private http:HttpClient) { }

  // Fetch Admins
  getOrganizations():Subscription{
    return this.http.get<Organization[]>(`${this.apiUrl}/organization`, this.httpOptions).pipe(
      map((orgs)=>({data:orgs} as Response<Organization[]>)),
      tap(orgs=>orgs),
      catchError((err:HttpErrorResponse)=>of({data:[],error:this.httpErrorFormatter(err)} as Response<Organization[]>))
    ).subscribe(res=>{
      if(res.data){
        this.organizationSub.next(res.data)
      }
    })
  }

  getOrganization(id:string):Observable<Response<Organization>>{
    return this.http.get<Organization>(`${this.apiUrl}/organization/${id}/`, this.httpOptions).pipe(
      map((org)=>({data:org} as Response<Organization>)),
      catchError((err:HttpErrorResponse)=>of({data:{},error:this.httpErrorFormatter(err)} as Response<Organization>))
    )
  }

  // Create Organizaion
  createOrganization(newOrganization: NewOrganization): Observable<Organization> {
    return this.http.post<Organization>(`${this.apiUrl}/organization/`, newOrganization,this.httpOptions).pipe(
      map(res=>{
        this.getOrganizations()
        return res
      })
    )
  }

  // Update organization
  updateOrganization(organization:Organization): Observable<any> {
    const {id, updated_at, deleted_at, created_at, organization_number, ...rest} = organization
    const body = {...rest}
    return this.http.put(`${this.apiUrl}/organization/${id}/`, body, this.httpOptions)
  }


  // Delete Organization
  deleteOrganization(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/organization/${id}/`,this.httpOptions);
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


  private organizationSub:BehaviorSubject<Organization[]> = new BehaviorSubject<Organization[]>([])
  orgnizations$:Observable<Organization[]> = this.organizationSub.asObservable()
}
