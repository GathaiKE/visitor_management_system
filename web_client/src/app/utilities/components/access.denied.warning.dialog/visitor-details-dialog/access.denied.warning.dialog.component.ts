import { Component } from '@angular/core';
import {  MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-access-denied-warning-dialog',
  standalone:true,
  imports:[MatDialogModule, CommonModule],
  templateUrl: './access.denied.warning.dialog.component.html',
  styleUrls: ['./access.denied.warning.dialog.component.css']
})
export class AccessDeniedDialogComponent {
  
  
  constructor(private dialogRef:MatDialogRef<AccessDeniedDialogComponent>){}
  
  cancel() {
    this.dialogRef.close();
  }
  }
  
