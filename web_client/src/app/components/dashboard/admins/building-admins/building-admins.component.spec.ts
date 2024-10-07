import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingAdminsComponent } from './building-admins.component';

describe('BuildingAdminsComponent', () => {
  let component: BuildingAdminsComponent;
  let fixture: ComponentFixture<BuildingAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingAdminsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildingAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
