import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const isLoggedInGuard: CanActivateFn = (
  route:ActivatedRouteSnapshot, 
  state:RouterStateSnapshot
  ) => {
  if(inject(AuthService).isLoggedIn()){
    return true
  }else{
    inject(Router).navigate(['/login'])
    return false
  }
};
