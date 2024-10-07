import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'demo-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsyncPipe, FormsModule],
  templateUrl: './demo-form.component.html',
  styleUrl: './demo-form.component.css'
})
export class DemoFormComponent implements OnInit, OnDestroy {
  @Input() formTemplate!: FormGroup;
  @Input() formConfig: {[key: string]: { label?: string, type: string, options?: any[]}} = {};
  @Input() size: string = '';
  @Input() submit: string = '';
  @Output() formValue = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();
  controls:any[] = []
  

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.initTypes()
  }

  initTypes(){
      this.controls = this.groupControls(this.formTemplate.controls)
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

  groupControls(controls: { [key: string]: any }): any[] {
    const controlKeys = Object.keys(this.formConfig)
    const result = controlKeys.map(key => ({ key, control: controls[key] }))
    return result;
  }
  
}
