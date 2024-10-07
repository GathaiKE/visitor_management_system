import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrganizationDialogComponent } from './edit-organization-dialog.component';

describe('EditOrganizationDialogComponent', () => {
  let component: EditOrganizationDialogComponent;
  let fixture: ComponentFixture<EditOrganizationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditOrganizationDialogComponent]
    });
    fixture = TestBed.createComponent(EditOrganizationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
