import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { FormGroup,  FormsModule,  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Building, Organization, PaymentMethod } from '../../../interfaces/interfaces';

@Component({
  selector: 'app-dual-row-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dual-row-form.component.html',
  styleUrl: './dual-row-form.component.css'
})
export class DualRowFormComponent implements OnDestroy, OnInit{
  @Input() formTemplate!: FormGroup;
  @Input() size: string = '';
  @Input() title: string = '';
  @Input() submit: string = '';
  @Input() abort: string = '';
  @Input() currentOrganization?:string = ''
  @Output() selectDay = new EventEmitter<any>();
  @Input() data?:any = null
  @Input() organizations?:any = null
  @Input() formConfig: { [key: string]: { label?: string, type: string, options?: any[] } } = {};
  @Output() formValue = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();
  @Input() showSelect?:boolean = false

  controls:any[][] = []
  organization:string = ''

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeBranches();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeBranches(): void {
    switch (true){
      case this.data !== null && 'building_name' in this.data[0]:
        let buildings:Building[] = this.data
        this.formConfig['building'].options = buildings.map(building=>({
          value:building.id,
          display:building.building_name
        }))
        this.controls = this.groupControls(this.formTemplate.controls)
        break;
        case this.data !== null && 'organization_name' in this.data[0]:
          let organizations:Organization[] = this.data
          this.formConfig['organization'].options = organizations.map(organization=>({
            value:organization.id,
            display:organization.organization_name
          }))
          this.controls = this.groupControls(this.formTemplate.controls)
          break;
          case this.data !== null && this.organizations !== null:
            let methods:PaymentMethod[] = this.data
            let orgs:Organization[] = this.organizations
            this.formConfig['organization'].options = orgs.map(organization=>({
              value:organization.id,
              display:organization.organization_name
            }))
            this.formConfig['paymentMethod'].options = methods.map(method=>({
              value:method.id,
              display:method.type
            }))
            this.controls = this.groupControls(this.formTemplate.controls)
            break;
      default:
        this.controls = this.groupControls(this.formTemplate.controls)
      break;
    }
  }

  submitForm(): void {
    let value = this.formTemplate?.value
    if(this.organization){
      value = {
        ...this.formTemplate?.value,
        organization:this.organization
      }
    }
      this.formValue.emit(value);
      this.closeForm();
  }

  groupControls(controls: { [key: string]: any }): any[][] {
    const grouped = [];
    const controlKeys = Object.keys(this.formConfig);

    for (let i = 0; i < controlKeys.length; i += 2) {
      const controlGroup = controlKeys.slice(i, i + 2).map(key => ({ key, control: controls[key] }));
      grouped.push(controlGroup);
    }
    return grouped;
  }

  closeForm(): void {
    this.formTemplate?.reset();
    this.closeEvent.emit();
  }

  selectDayFn(val:string){
    this.selectDay.emit(val)
  }
}
