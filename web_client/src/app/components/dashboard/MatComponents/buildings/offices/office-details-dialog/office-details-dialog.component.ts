import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Response } from '../../../../../../utilities/utilities';
import { CommonModule } from '@angular/common';
import { OfficesService } from '../../../../../../services/offices.service';
import { Office } from '../../../../../../interfaces/interfaces';

@Component({
  selector: 'app-office-details-dialog',
  standalone:true,
  imports:[MatDialogModule, CommonModule],
  templateUrl: './office-details-dialog.component.html',
  styleUrls: ['./office-details-dialog.component.css']
})
export class OfficeDetailsDialogComponent {
  office!:Office
  offices!:Office[]
  
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service:OfficesService, 
    private dialogRef:MatDialogRef<OfficeDetailsDialogComponent>
    ){
    
      this.service.getOffices().subscribe(
        (response:Response<Office[]>)=>{
          const offices:Office[] = response.data
          this.office = offices.find((office)=>office.id === this.data.id) as Office
        }
      )
  }
  
  cancel() {
    this.dialogRef.close();
  }
  }
  
