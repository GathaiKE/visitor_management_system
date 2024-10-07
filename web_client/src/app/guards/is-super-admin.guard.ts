import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AccessDeniedDialogComponent } from '../utilities/components/access.denied.warning.dialog/visitor-details-dialog/access.denied.warning.dialog.component';

export const isSuperAdminGuard: CanActivateFn = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot) => {
  if(inject(AuthService).isSuperAdmin()){
    return true
  } else{
    inject(MatDialog).open(AccessDeniedDialogComponent,{
      width:'20%',
      height:'20%'
    })
    return false;
  }
};
