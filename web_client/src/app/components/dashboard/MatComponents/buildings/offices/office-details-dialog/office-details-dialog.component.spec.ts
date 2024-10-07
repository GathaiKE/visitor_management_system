import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeDetailsDialogComponent } from './office-details-dialog.component';

describe('OfficeDetailsDialogComponent', () => {
  let component: OfficeDetailsDialogComponent;
  let fixture: ComponentFixture<OfficeDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfficeDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(OfficeDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
