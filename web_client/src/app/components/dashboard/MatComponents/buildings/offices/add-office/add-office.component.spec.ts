import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOfficeComponent } from './add-office.component';

describe('AddFloorComponent', () => {
  let component: AddOfficeComponent;
  let fixture: ComponentFixture<AddOfficeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddOfficeComponent]
    });
    fixture = TestBed.createComponent(AddOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
