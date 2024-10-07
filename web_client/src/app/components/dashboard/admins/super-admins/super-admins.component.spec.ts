import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminsComponent } from './super-admins.component';

describe('SuperAdminsComponent', () => {
  let component: SuperAdminsComponent;
  let fixture: ComponentFixture<SuperAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuperAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
