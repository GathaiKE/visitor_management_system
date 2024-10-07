import { Component, OnInit, Signal, computed } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FloorsService } from '../../../../../../services/floors.service';
import { BuildingsService } from '../../../../../../services/buildings.service';
import { Building, Floor } from '../../../../../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OfficesService } from '../../../../../../services/offices.service';

@Component({
  selector: 'app-add-office',
  standalone:true,
  imports:[CommonModule, MatFormFieldModule, MatIconModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-office.component.html',
  styleUrls: ['./add-office.component.css'],
})
export class AddOfficeComponent {
  officeForm!: FormGroup;
  floors!:Signal<Floor[]>

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddOfficeComponent>,
    private snackBar: MatSnackBar,
    private officeService: OfficesService,
  ) {
    this.initForm();
  }

  initForm() {
    this.officeForm = this.fb.group({
      office: ['', [Validators.required]],
    });
  }

  add() {
    if (this.officeForm.valid) {
      const newOffice:{office_name:string, floor:string}={
        office_name: this.officeForm.get('office')?.value,
        floor: this.officeService.floorId()
      }

      this.officeService.addOffice(newOffice).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          this.snackBar.open('Failed to Create Office', 'Close', {
            duration: 2000,
          });
        }
      );
    } else {
      this.snackBar.open('Form is invalid', 'Close', {
        duration: 2000,
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
