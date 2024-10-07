import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, Signal, ViewChild, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';
import { FooterComponent } from '../../../utilities/components/footer/footer.component';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { Office } from '../../../interfaces/interfaces';
import { OfficesService } from '../../../services/offices.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AddOfficeComponent } from '../MatComponents/buildings/offices/add-office/add-office.component';
import { BuildingDeleteDialogComponent } from '../MatComponents/buildings/buildings/building-delete-dialog/building-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfficeEditComponent } from '../MatComponents/buildings/offices/office-edit/office-edit.component';
import { OfficeDetailsDialogComponent } from '../MatComponents/buildings/offices/office-details-dialog/office-details-dialog.component';


@Component({
  selector: 'app-offices',
  standalone: true,
  imports: [SidenavComponent, CommonModule, HeaderComponent, FooterComponent, MatIconModule, MatTableModule, MatTooltipModule, MatPaginatorModule, MatSortModule],
  templateUrl: './offices.component.html',
  styleUrl: './offices.component.css'
})
export class OfficesComponent {

  @ViewChild(MatPaginator) paginator!:MatPaginator
  @ViewChild(MatSort) sort!:MatSort


  dataSource!:MatTableDataSource<Office>
  xsmDisplayedColumns: string[] =  ['office', 'floor', 'actions'];
  smDisplayedColumns: string[] =  ['office', 'floor', 'actions'];
  mdDisplayedColumns: string[] =  ['office', 'building', 'floor', 'actions'];
  lgDisplayedColumns: string[] =  ['office', 'organization', 'building', 'floor', 'actions'];
  xlDisplayedColumns: string[] =  ['office', 'organization', 'building', 'floor', 'actions'];
  defaultDisplayedColumns:string[] = ['office', 'organization', 'building', 'floor', 'actions'];
  columnsToDisplay: string[] = this.resize();
  data!:Signal<Office[]>
  filteredData!:Signal<Office[]>
  fetchErr!:Signal<string | undefined>
  

  constructor(private officeService:OfficesService, private dialog:MatDialog, private snackBar:MatSnackBar, private location:Location){
    this.fetchData()
  }


  fetchData(){
    this.officeService.getOffices().subscribe(res=>{
      this.data = computed(()=>(res.data).filter(office=>office.floor.id === this.officeService.floorId()))
      this.fetchErr = computed(()=>res.error)
      this.filteredData = computed(()=>this.data().slice())
      this.dataSource = new MatTableDataSource(this.filteredData())
      setTimeout(() => {
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
      }, 10);
    })
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
      return item.office_name.toLowerCase().trim().includes(filterValue) ||
      item.floor.building.building_name.toLowerCase().trim().includes(filterValue) ||
      item.floor.building.organization?.organization_name.toLowerCase().trim().includes(filterValue)
    })

    if(this.dataSource.paginator){
      this.dataSource.paginator.firstPage()
    }
  }

  
  goBack(){
    this.location.back()
  }

  newOffice(){
    const dialogRef = this.dialog.open(AddOfficeComponent, {
      width: '20%',
      height: '35%',
    });


    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchData()
      }
    });
  }

  details(id:string){
    const dialogRef = this.dialog.open(OfficeDetailsDialogComponent, {
      data: { id: id },
      width:'500px',
      height: '250px'
    });
  }

  update(office:Office){
    const dialogRef = this.dialog.open(OfficeEditComponent, {
      data: { id: office.id, name :office.office_name},
      width:'20%',
      height:'35%'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(result){
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
        this.officeService.deleteOffice(id).subscribe(
          () => {
            this.snackBar.open('Office Deleted successfully', 'Close', {
              duration: 2000,
            });
              this.fetchData();
          },
          (error) => {
            this.snackBar.open(`Error ${error.status}: Failed to Delete Office`, 'Close', {
              duration: 2000,
            });
          }
        );
      }
    });
  }

}
