import { Injectable } from '@angular/core';
import { Admin } from '../interfaces/interfaces';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUserSub:BehaviorSubject<Admin | null> = new BehaviorSubject<Admin | null>(null)
  tokenSub:BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null)
  currentUser$:Observable<Admin | null> = this.currentUserSub.asObservable()
  token:Observable<string | null> = this.tokenSub.asObservable()
  user!: Admin

  constructor(){
    this.tokenSub.next(localStorage.getItem('authToken'))
    this.currentUser$.subscribe(user=>{
      if(user){
        this.user = user
      }
    })
  }

  isLoggedIn(): boolean {
    return this.token ? true : false
  }

  isSuperAdmin(): boolean {
    return this.user?.is_superuser ? true : false
  }

  isClientAdmin(): boolean {
    return this.user?.is_admin ? true : false
  }

  isBuildingAdmin(): boolean {
    return this.user?.is_staff ? true : false
  }
  isAssistantSuperAdmin(): boolean {
    return this.user?.is_assistant_superuser ? true : false
  }

  logOut(){
    localStorage.clear()
  }
}
