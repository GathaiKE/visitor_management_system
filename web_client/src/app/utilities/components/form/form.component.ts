import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Admin, Building, Floor, Organization } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsyncPipe, FormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit, OnDestroy {
  @Input() formTemplate!: FormGroup;
  @Input() formConfig: {[key: string]: { label?: string, type: string, options?: any[]}} = {};
  @Input() size: string = '';
  @Input() title: string = '';
  @Input() submit: string = '';
  @Input() abort: string = '';
  @Input() staff:Admin[] = []
  @Input() data?:any = null
  @Input() types?:any[] = []
  @Input() currentOrganization?:string = ''
  @Input() organizations?:Organization[] = []
  @Input() showSelect?:boolean = false
  @Output() formValue = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();

  filteredDataSub:Subject<Admin[]> = new Subject()
  filteredData$:Observable<Admin[]> = this.filteredDataSub.asObservable()
  controls:any[] = []
  selectedOrganization:string = ''
  

  private unsubscribe$ = new Subject<void>();

  initComponent(){
    this.initTypes()
  }

  ngOnInit(): void {
    if(this.currentOrganization?.length !== 0){
      this.selectedOrganization = this.currentOrganization as string
    }
   this.initComponent()
  }

  initTypes(){
    switch(true){
      case this.data !== null && 'floor_number' in this.data[0]:
        let floors:Floor[] = this.data
        this.formConfig['floor'].options = floors.map(floor=>({
          value:floor.id,
          display: floor.floor_number === '0'?'Ground Floor':floor.floor_number
        }))
        this.controls = this.groupControls(this.formTemplate.controls)
        break;
        case this.data !== null && 'organization_number' in this.data[0]:
          let organizations:Organization[] = this.data
          this.formConfig['organization'].options = organizations.map(organization=>({
            value:organization.id,
            display: organization.organization_name
          }))
          this.controls = this.groupControls(this.formTemplate.controls)
          break;
        case this.data !== null && 'floors' in this.data[0]:
          let buildings:Building[] = this.data
          this.formConfig['building'].options = buildings.map(building=>({
            value:building.id,
            display: building.building_name
          }))
          this.controls = this.groupControls(this.formTemplate.controls)
          break;
      default:
        this.controls = this.groupControls(this.formTemplate.controls)
        break;
    }
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submitForm(): void {
    if (this.formTemplate.valid) {
      this.formValue.emit(this.formTemplate.value);
      this.closeForm()
    }
  }

  closeForm(): void {
    this.formTemplate.reset();
    this.closeEvent.emit();
  }

  selectStaff(staff: Admin): void {
    this.formTemplate.patchValue({ id: staff.id });
    this.filteredDataSub.next([staff]);
  }

  groupControls(controls: { [key: string]: any }): any[] {
    const controlKeys = Object.keys(this.formConfig)
    const result = controlKeys.map(key => ({ key, control: controls[key] }))
    return result;
  }  
}
