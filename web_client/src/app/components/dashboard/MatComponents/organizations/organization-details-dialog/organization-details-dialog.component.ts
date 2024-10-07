import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Admin, Organization } from '../../../../../interfaces/interfaces';
import { OrganizationsService } from '../../../../../services/organizations.service';
import { Response } from '../../../../../utilities/utilities';
import { CommonModule } from '@angular/common';
import { AdminsService } from '../../../../../services/admins.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-visitor-details-dialog',
  standalone:true,
  imports:[MatDialogModule, CommonModule],
  templateUrl: './organization-details-dialog.component.html',
  styleUrls: ['./organization-details-dialog.component.css']
})
export class OrganizationDetailsDialogComponent {
  organization!:Organization
  organizations!:Organization[]
  admin!:Admin
  
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service:OrganizationsService, 
    private dialogRef:MatDialogRef<OrganizationDetailsDialogComponent>,
    private adminService:AdminsService
    ){

      this.service.getOrganizations().pipe(
        switchMap((response: Response<Organization[]>) => {
          const organizations: Organization[] = response.data;
          this.organization = organizations.find(organization => organization.id === this.data.id) as Organization;
      
          return this.adminService.getAdmins().pipe(
            map(res => res.data),
            map(admins => admins.find(admin => admin.organization?.id === this.organization.id) as Admin)
          );
        })
      ).subscribe(admin => {
        this.admin = admin;
      });
  }
  
  cancel() {
    this.dialogRef.close();
  }
  }
  
