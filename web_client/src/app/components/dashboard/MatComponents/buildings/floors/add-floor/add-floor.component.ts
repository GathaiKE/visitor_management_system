import { Component, OnInit, Signal, computed } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FloorsService } from '../../../../../../services/floors.service';
import { BuildingsService } from '../../../../../../services/buildings.service';
import { Building } from '../../../../../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-floor',
  standalone:true,
  imports:[CommonModule, MatFormFieldModule, MatIconModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-floor.component.html',
  styleUrls: ['./add-floor.component.css'],
})
export class AddFloorComponent {
  floorForm!: FormGroup;
  buildings!:Signal<Building[]>
  orgId!:string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddFloorComponent>,
    private snackBar: MatSnackBar,
    private floorService: FloorsService, // Inject FloorService
    private buildingService:BuildingsService
  ) {
    this.initForm();
    this.getAllBuildings(); // Fixed the method name to match the service
    this.orgId = localStorage.getItem('orgId') as string
  }

  initForm() {
    this.floorForm = this.fb.group({
      floor_number: ['', [Validators.required]],
    });
  }

  getAllBuildings() {
    // this.buildingService.getBuildings().subscribe((response) => {
    //   this.buildings = computed(()=>(response.data).filter((building)=>building.organization?.id === this.orgId));
    // });
  }

  add() {
    if (this.floorForm.valid) {
      const building_id:string = this.floorService.buildingId()
      const formData = {
        floor_number:this.floorForm.get('floor_number')?.value,
        building:building_id
      }

      this.floorService.addFloor(formData).subscribe(
        (response) => {
          this.dialogRef.close(response);
        },
        (error) => {
          this.snackBar.open('Failed to create floor', 'Close', {
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
