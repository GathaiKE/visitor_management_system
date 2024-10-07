import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Admin } from '../../../../../interfaces/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-details.component.html',
  styleUrl: './admin-details.component.css'
})
export class AdminDetailsComponent {
  admin!:Admin
  constructor(private dialogRef:MatDialogRef<AdminDetailsComponent>, @Inject(MAT_DIALOG_DATA) private data:{admin:Admin}){ this.admin = this.data.admin}


  cancel(){
    this.dialogRef.close()
  }
}
