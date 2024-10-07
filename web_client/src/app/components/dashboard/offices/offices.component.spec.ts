import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficesComponent } from './offices.component';

describe('OfficesComponent', () => {
  let component: OfficesComponent;
  let fixture: ComponentFixture<OfficesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OfficesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
