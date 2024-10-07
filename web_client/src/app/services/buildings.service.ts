import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, catchError, map, of } from 'rxjs';
import { Response } from '../utilities/utilities'
import { Building, NewBuilding } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService {

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

  // Fetch Buildings
  getBuildings(id?:string):Subscription{
    return this.http.get<Building[]>(`${this.apiUrl}/building`, this.httpOptions).pipe(
      map((buildings)=>id?({data:buildings.filter(building=>building.organization?.id === id)} as Response<Building[]>):({data:buildings} as Response<Building[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[],error:this.httpErrorFormatter(err)} as Response<Building[]>))
    ).subscribe(res=>{
      this.buildingSub.next(res.data)
    })
  }

  getBuilding(id:string):Observable<Response<Building>>{
    return this.http.get<Building>(`${this.apiUrl}/building/${id}`, this.httpOptions).pipe(
      map((orgs)=>({data:orgs} as Response<Building>)),
      catchError((err:HttpErrorResponse)=>of({data:{},error:this.httpErrorFormatter(err)} as Response<Building>))
    )
  }

  // Create Building
  createBuilding(building:NewBuilding): Observable<Building> {
    return this.http.post<Building>(`${this.apiUrl}/building/`, building,this.httpOptions).pipe(
      map(res=>{
        this.getBuildings()
        return res
      })
    )
  }

  // Update Building
  updateBuilding(building:Building): Observable<Building> {
    const {id, created_at, deleted_at, updated_at, ...rest} = building
    const body = {...rest}
    return this.http.put<Building>(`${this.apiUrl}/building/${building.id}/`, body, this.httpOptions)
  }


  // Delete Organization
  deleteBuilding(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/building/${id}/`,this.httpOptions);
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

  private buildingSub:BehaviorSubject<Building[]> = new BehaviorSubject<Building[]>([])
  buildings$:Observable<Building[]> = this.buildingSub.asObservable()
}
