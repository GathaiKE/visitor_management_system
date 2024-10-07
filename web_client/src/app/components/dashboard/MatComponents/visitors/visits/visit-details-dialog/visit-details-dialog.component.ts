import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Response } from '../../../../../../utilities/utilities';
import { CommonModule } from '@angular/common';
import { VisitData, Visitor } from '../../../../../../interfaces/interfaces';
import { VisitorsService } from '../../../../../../services/visitors.service';

@Component({
  selector: 'app-visit-details-dialog',
  standalone:true,
  imports:[MatDialogModule, CommonModule],
  templateUrl: './visit-details-dialog.component.html',
  styleUrls: ['./visit-details-dialog.component.css']
})
export class VisitDetailsDialogComponent {
  visit!:VisitData
  visitors!:VisitData[]
  
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private visitorService:VisitorsService, 
    private dialogRef:MatDialogRef<VisitDetailsDialogComponent>
    ){
    
      // this.visitorService.getVisits().subscribe(
      //   (response)=>{
      //     const visits:VisitData[] = response
      //     this.visit = visits.find((visit)=>visit.id === this.data.id) as VisitData
      //   }
      // )
  }
  
  cancel() {
    this.dialogRef.close();
  }
  }
  
