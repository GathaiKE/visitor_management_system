import { Component } from '@angular/core';
import { HeaderComponent } from '../../../utilities/components/header/header.component';
import { SidenavComponent } from '../../../utilities/components/sidenav/sidenav.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent {

}
