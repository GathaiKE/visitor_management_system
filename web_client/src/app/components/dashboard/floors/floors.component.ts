import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, Signal, ViewChild, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { FooterComponent } from '../../../utilities/components/footer/footer.component';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { Floor } from '../../../interfaces/interfaces';
import { FloorsService } from '../../../services/floors.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BuildingDeleteDialogComponent } from '../MatComponents/buildings/buildings/building-delete-dialog/building-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddFloorComponent } from '../MatComponents/buildings/floors/add-floor/add-floor.component';
import { OfficesService } from '../../../services/offices.service';


@Component({
  selector: 'app-floors',
  standalone: true,
  imports: [SidenavComponent, CommonModule, MatPaginatorModule, MatFormFieldModule, MatHint, FooterComponent, HeaderComponent, MatIconModule, MatTableModule, MatTooltipModule],
  templateUrl: './floors.component.html',
  styleUrl: './floors.component.css'
})
export class FloorsComponent {

  @ViewChild(MatPaginator) paginator!:MatPaginator
  @ViewChild(MatSort) sort!:MatSort


  dataSource!:MatTableDataSource<Floor>
  xsmDisplayedColumns: string[] = ['floor_number', 'actions'];
  smDisplayedColumns: string[] = ['floor_number', 'building_name', 'actions'];
  mdDisplayedColumns: string[] = ['floor_number','building_name', 'actions'];
  lgDisplayedColumns: string[] = ['floor_number','building_name','organization_name', 'actions'];
  xlDisplayedColumns: string[] = ['floor_number','building_name','organization_name', 'actions'];
  defaultDisplayedColumns:string[] = ['floor_number','building_name','organization_name', 'actions'];
  columnsToDisplay: string[] = this.resize();
  data!:Signal<Floor[]>
  filteredData!:Signal<Floor[]>
  floorsCount!:number
  

  constructor(private fb:FormBuilder, private floorService:FloorsService, private officeService:OfficesService, private router:Router, private dialog:MatDialog, private snackBar:MatSnackBar, private location:Location){
    this.fetchData()
  }

  fetchData(){
    let id = ''
    this.floorService.getFloors(id).subscribe(res=>{
      this.data = computed(()=>(res.data).filter(floor=>floor.building.id === this.floorService.buildingId()))
      this.floorsCount = this.data().length
      this.filteredData = computed(()=>this.data().slice())
      this.dataSource = new MatTableDataSource(this.filteredData())
      setTimeout(() => {
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
      }, 10);
    })
  }

  goBack(){
    this.location.back()
  }
  

  @HostListener('window:resize')
  onResize(event:Event){
    this.resize()
  }


  resize():string[] {
    const width:number = window.innerWidth
    let result:string[] = []

    switch (true) {
      case (width <= 390):
        result = this.xsmDisplayedColumns.slice();
        break;
      case (width > 390 && width <= 590):
        result = this.smDisplayedColumns.slice();
        break;
      case (width > 590 && width <= 780):
        result = this.mdDisplayedColumns.slice();
        break;
      case (width > 780 && width <= 992):
        result = this.lgDisplayedColumns.slice();
        break;
      default:
        result = this.xlDisplayedColumns.slice(); // Adjust as needed
        break;
    }
    

    return result
  }


  applyFilter(event:Event){
    const filterValue:string = (event.target as HTMLInputElement).value.toLowerCase().trim()

    this.dataSource.data = this.data().filter(item=>{
      return item.floor_number.toLowerCase().trim().includes(filterValue) ||
      item.building.building_name.toLowerCase().trim().includes(filterValue)
    })

    if(this.dataSource.paginator){
      this.dataSource.paginator.firstPage()
    }
  }

  newFloor(){
    const dialogRef = this.dialog.open(AddFloorComponent, {
      width: '20%',
      height: '35%',
    });


    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchData()
      }
    });
  }

  deleteItem(id:string){
    const dialogRef = this.dialog.open(BuildingDeleteDialogComponent, {
      width: '30%',
      height:'30%'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.floorService.deleteFloor(id).subscribe(
          () => {
            this.snackBar.open('Floor Removed successfully', 'Close', {
              duration: 2000,
            });
              this.fetchData();
          },
          (error) => {
            this.snackBar.open(`Error ${error.status}: Failed to Remove Floor`, 'Close', {
              duration: 2000,
            });
          }
        );
      }
    });
  }

  details(id:string){
    this.officeService.updateFloorId(id)
    this.router.navigate(['offices'])
  }

  toggleFilterMenu(){

  }
}
