import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { Response } from '../../utilities/utilities';
import { Admin } from '../../interfaces/interfaces';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl: string = environment.USERS_BASE_URL;
  constructor(private http:HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, { username, password }).pipe(
      map((response: any) => {
        if (response && response.token) {
          const token:string = response.token as string;
          const user:Admin = response.user as Admin
          localStorage.setItem('user',user.id)
          localStorage.setItem('authToken',token)
        }
        return response;
      })
    );
  }
}
