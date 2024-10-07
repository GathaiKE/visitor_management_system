import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Response } from '../../../../../../utilities/utilities';
import { CommonModule } from '@angular/common';
import { Visitor } from '../../../../../../interfaces/interfaces';
import { VisitorsService } from '../../../../../../services/visitors.service';

@Component({
  selector: 'app-visitor-details-dialog',
  standalone:true,
  imports:[MatDialogModule, CommonModule],
  templateUrl: './visitor-details-dialog.component.html',
  styleUrls: ['./visitor-details-dialog.component.css']
})
export class VisitorDetailsDialogComponent {
  visitor!:Visitor
  visitors!:Visitor[]
  
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private visitorService:VisitorsService, 
    private dialogRef:MatDialogRef<VisitorDetailsDialogComponent>
    ){
    
      this.visitorService.getVisitors().subscribe(
        (response:Response<Visitor[]>)=>{
          const visitors:Visitor[] = response.data
          this.visitor = visitors.find((visitor)=>visitor.id === this.data.id) as Visitor
        }
      )
  }
  
  cancel() {
    this.dialogRef.close();
  }
  }
  
