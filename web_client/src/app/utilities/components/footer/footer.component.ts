import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  year!:any
  email:string = "support.ams@cintelcore.com"
  location:string = "Fort Granite, Bishop Road-Upperhill, Nairobi-Kenya"
  link:string = "www.cintelcore.com"
  contacts:string[]=["0 000 000", "1 234 567"]

  constructor(){
    this.year = new Date().getFullYear()
  }
}
