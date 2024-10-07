import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminsService } from '../../../../../services/admins.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Admin } from '../../../../../interfaces/interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

interface updateData{
  admin:Admin
}
@Component({
  selector: 'app-edit-admin',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule],
  templateUrl: './edit-admin.component.html',
  styleUrl: './edit-admin.component.css'
})
export class EditAdminComponent {

  updateAdminForm!:FormGroup

  constructor(private fb:FormBuilder, private adminService:AdminsService, @Inject(MAT_DIALOG_DATA) private data:updateData, private snackBar:MatSnackBar, private dialogRef:MatDialogRef<EditAdminComponent>){
    this.initForm()
  }

  initForm(){
    this.updateAdminForm = this.fb.group({
      first_name:[this.data.admin.first_name],
      last_name:[this.data.admin.last_name],
      email:[this.data.admin.email],
      username:[this.data.admin.username],
      telephone:[this.data.admin.phone_number]
    })
  }


  update(){
    let phone:string = this.updateAdminForm.get('telephone')?.value
    let phone_number_chars = phone.slice(-9)
    let final_phone_number:string = `254`+phone_number_chars
    const adminData:Admin = {
      ...this.data.admin,
      first_name:this.updateAdminForm.get('first_name')?.value,
      last_name:this.updateAdminForm.get('last_name')?.value,
      email:this.updateAdminForm.get('email')?.value,
      username:this.updateAdminForm.get('username')?.value,
      phone_number:final_phone_number,
    }
    this.adminService.updateAdmin(adminData).subscribe((response)=>{
      this.dialogRef.close(response);
      this.snackBar.open('Update Successfull!', 'close', {duration:2500})
    },(error)=>{
      console.log(error);
      this.snackBar.open('Update Failed!', 'close', {duration:2500})
    })
  }

  cancel(){

  }

}
