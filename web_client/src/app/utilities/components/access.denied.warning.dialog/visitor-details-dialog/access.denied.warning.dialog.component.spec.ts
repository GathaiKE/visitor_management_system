import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDeniedDialogComponent } from './access.denied.warning.dialog.component';

describe('AccessDeniedDialogComponent', () => {
  let component: AccessDeniedDialogComponent;
  let fixture: ComponentFixture<AccessDeniedDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessDeniedDialogComponent]
    });
    fixture = TestBed.createComponent(AccessDeniedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
