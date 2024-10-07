import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDetailsDialogComponent } from './organization-details-dialog.component';

describe('OrganizationDetailsDialogComponent', () => {
  let component: OrganizationDetailsDialogComponent;
  let fixture: ComponentFixture<OrganizationDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(OrganizationDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
