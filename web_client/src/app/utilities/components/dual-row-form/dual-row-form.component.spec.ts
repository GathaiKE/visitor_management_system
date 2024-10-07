import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DualRowFormComponent } from './dual-row-form.component';

describe('DualRowFormComponent', () => {
  let component: DualRowFormComponent;
  let fixture: ComponentFixture<DualRowFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DualRowFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DualRowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
