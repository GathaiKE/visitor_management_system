import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitDetailsDialogComponent } from './visit-details-dialog.component';

describe('VisitDetailsDialogComponent', () => {
  let component: VisitDetailsDialogComponent;
  let fixture: ComponentFixture<VisitDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisitDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(VisitDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
