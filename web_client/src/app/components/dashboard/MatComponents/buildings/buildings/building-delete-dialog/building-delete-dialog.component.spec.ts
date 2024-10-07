import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildingDeleteDialogComponent } from './building-delete-dialog.component';

describe('BuildingDeleteDialogComponent', () => {
  let component: BuildingDeleteDialogComponent;
  let fixture: ComponentFixture<BuildingDeleteDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuildingDeleteDialogComponent]
    });
    fixture = TestBed.createComponent(BuildingDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
