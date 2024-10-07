import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorDetailsDialogComponent } from './visitor-details-dialog.component';

describe('VisitorDetailsDialogComponent', () => {
  let component: VisitorDetailsDialogComponent;
  let fixture: ComponentFixture<VisitorDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisitorDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(VisitorDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
