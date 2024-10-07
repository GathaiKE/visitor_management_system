import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, forkJoin, map, of, tap } from 'rxjs';
import { Building, Floor, Office, Traffic, Visit, VisitData, Visitor } from '../interfaces/interfaces';
import { environment } from '../../environments/environment';
import { Response } from '../utilities/utilities';
import { BuildingsService } from './buildings.service';
import { OfficesService } from './offices.service';
import { FloorsService } from './floors.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {
token:string = localStorage.getItem('authToken') as string
apiUrl:string = environment.USERS_BASE_URL
jsonServer:string = environment.JSON_SERVER_URL
headers = new HttpHeaders({
  'Content-Type':'application/json',
  'Authorization': `Token ${this.token}`
})
httpOptions = {
  headers:this.headers
}
buildings!:Building[]
buildingIds:string[] = []



  constructor(private http:HttpClient, private buildingService:BuildingsService, private officeService:OfficesService, private floorService:FloorsService, private authService:AuthService) { 
    this.buildingService.getBuildings()
    this.buildingService.buildings$.subscribe(res=>{
      this.buildings = res.filter(building=>building.organization?.id === this.authService.user.organization?.id)
      this.buildings.forEach(b=>this.buildingIds.push(b.id))
    })
  }

  getVisitors():Observable<Response<Visitor[]>>{
    return this.http.get<Visitor[]>(`${this.apiUrl}/visitor`,this.httpOptions).pipe(
      map(visitors=>({data:visitors} as Response<Visitor[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[], error:this.httpErrorFormatter(err)} as Response<Visitor[]>))
    )
  }

  // private getVisitsData():Observable<Response<Visit[]>>{
  //   if(this.authService.isClientAdmin()){
  //     return this.http.get<Visit[]>(`${this.apiUrl}/visit`,this.httpOptions).pipe(
  //       map(visits=>({data:visits.filter(visit=>this.buildingIds.includes(visit.building_id))} as Response<Visit[]>)),
  //       catchError((err:HttpErrorResponse)=>of({data:[], error:this.httpErrorFormatter(err)} as Response<Visit[]>))
  //     )
  //   } else if(this.authService.isBuildingAdmin()){
  //     const buildingId:string = this.authService.user.building?.id as string
  //     return this.http.get<Visit[]>(`${this.apiUrl}/visit`,this.httpOptions).pipe(
  //       map(visits=>({data:visits.filter(visit=>visit.building_id === buildingId)} as Response<Visit[]>)),
  //       catchError((err:HttpErrorResponse)=>of({data:[], error:this.httpErrorFormatter(err)} as Response<Visit[]>))
  //     )
  //   } else{
  //     return this.http.get<Visit[]>(`${this.apiUrl}/visit`,this.httpOptions).pipe(
  //       map(visits=>({data:visits} as Response<Visit[]>)),
  //       catchError((err:HttpErrorResponse)=>of({data:[], error:this.httpErrorFormatter(err)} as Response<Visit[]>))
  //     )
  //   }
    
  // }

  // getVisits(): Observable<VisitData[]> {
  //   return new Observable(observer => {
  //     forkJoin([
  //       this.getVisitsData().pipe(map(visits => visits.data)),
  //       this.getVisitors().pipe(map(visitors => visitors.data)),
  //       this.buildingService.getBuildings().pipe(map(buildings => buildings.data)),
  //       this.officeService.getOffices('jbjhbbjbd').pipe(map(offices => offices.data)),
  //       this.floorService.getFloors().pipe(map(floors => floors.data))
  //     ]).pipe(
  //       map(([visits, visitors, buildings, offices, floors]) => {
  //         return visits?.map(visit => {
  //           let visitor:Visitor = visitors?.find(visitor => visitor.id === visit.visitor_id) as Visitor;
  //           let office:Office = offices.find(office => office.id === visit.office_id) as Office;
  //           let floor:Floor = floors.find(floor => floor.id === visit.floor_id) as Floor;
  //           let building:Building = buildings.find(building=>building.id === visit.building_id) as Building
  //           let data:VisitData = {
  //             id: visit.id,
  //             id_number: visitor ? visitor.id_number : '',
  //             first_name: visitor ? visitor.first_name : '',
  //             last_name: visitor ? visitor.last_name : '',
  //             checkin_time: visit.checkin_time,
  //             checkout_time: visit.checkout_time,
  //             organization_name:floor?floor.building.organization?.organization_name:'',
  //             building_name: building.building_name,
  //             phone_number: visitor ? visitor.phone_number : '',
  //             is_checked_in: visit.is_checked_in,
  //             floor_number: floor ? floor.floor_number : '',
  //             office_name: office ? office.office_name : ''
  //           };
  //           return data
  //         });
  //       })
  //     ).subscribe(visitData => {
  //       observer.next(visitData);
  //       observer.complete();
  //     });
  //   });
  // }

  getVisits(id?:string):Subscription{
    return this.http.get<Visit[]>(`${this.apiUrl}/visit/${id}/`, this.httpOptions).pipe(
      map((res)=>({data:res} as Response<Visit[]>)),
      catchError((err:HttpErrorResponse)=>of({data:[], error:err.error} as Response<Visit[]>))
    ).subscribe(res=>{
      this.visitSub.next(res.data)
    })
  }

getTraffic(id?: string):Traffic[] {
    this.getVisits()
    let traffic:Traffic[] = []
    this.visits$.subscribe(res => {
        if (res) {
            let visits: Visit[] = res;

            let hours: number[] = [];
            for (let hour = 0; hour < 24; hour++) {
              hours.push(hour);
            }

            hours.forEach(hour => {
                let hourlyVisits: number = visits.filter(visit => {
                    let visitHour:number = new Date(visit.checkin_time).getHours();
                    return visitHour === hour;
                }).length;

                switch(true){
                  case hour === 0:
                    traffic.push({ hour: 'Midnight', visits: hourlyVisits });
                    break;
                  case hour === 12:
                    traffic.push({ hour: 'Noon', visits: hourlyVisits });
                    break;
                  case hour < 12:
                    traffic.push({ hour: hour+' AM', visits: hourlyVisits });
                    break;
                  case hour > 12:
                    traffic.push({ hour: hour-12+' PM', visits: hourlyVisits });
                    break;
                  default:
                    break;
                }
            });
        }

      });
      return traffic
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

  private visitSub:BehaviorSubject<Visit[]> = new BehaviorSubject<Visit[]>([])
  visits$:Observable<Visit[]> = this.visitSub.asObservable()
}
