import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFloorComponent } from './add-floor.component';

describe('AddFloorComponent', () => {
  let component: AddFloorComponent;
  let fixture: ComponentFixture<AddFloorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFloorComponent]
    });
    fixture = TestBed.createComponent(AddFloorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
