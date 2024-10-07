import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeEditComponent } from './office-edit.component';

describe('BuildingEditComponent', () => {
  let component: OfficeEditComponent;
  let fixture: ComponentFixture<OfficeEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OfficeEditComponent]
    });
    fixture = TestBed.createComponent(OfficeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
