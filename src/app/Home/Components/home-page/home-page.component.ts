import { Component } from '@angular/core';
import { ProjectListComponent } from "../../../Project/Components/project-list-component/project-list.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ProjectListComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
