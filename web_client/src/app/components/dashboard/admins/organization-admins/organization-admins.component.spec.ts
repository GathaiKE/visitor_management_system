import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAdminsComponent } from './organization-admins.component';

describe('OrganizationAdminsComponent', () => {
  let component: OrganizationAdminsComponent;
  let fixture: ComponentFixture<OrganizationAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationAdminsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizationAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
