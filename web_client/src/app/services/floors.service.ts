import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from '../utilities/utilities';
import { Floor } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FloorsService {

  private buildingIdSub:BehaviorSubject<string> = new BehaviorSubject<string>('')
  private buildingId$:Observable<string> = this.buildingIdSub.asObservable()
  buildingId!:Signal<string>
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
    this.buildingId$.subscribe(id=>this.buildingId = computed(()=>id))
  }

  getFloors(id:string):Observable<Response<Floor[]>>{
    return this.http.get<Floor[]>(`${this.apiUrl}/floor`, this.httpOptions).pipe(
      map(floors=>({data:floors.filter(floor=>floor.building.id === id)} as Response<Floor[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[],error:this.httpErrorFormatter(err)} as Response<Floor[]>))
    )
  }

  addFloor(data: {
    building: string;
    floor_number: number;
  }): Observable<Floor> {
    return this.http.post<Floor>(`${this.apiUrl}/floor/`, data,this.httpOptions);
  }

  deleteFloor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/floor/${id}/`,this.httpOptions);
  }

  updateBuildingId(id:string){
    this.buildingIdSub.next(id)
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
}
