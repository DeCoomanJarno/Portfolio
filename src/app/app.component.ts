import { Component, OnInit } from '@angular/core';
import {  Router, NavigationEnd, RouterOutlet, RouterModule, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from './Core/Components/header/header.component';
import { FooterComponent } from './Core/Components/Footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, HeaderComponent, RouterModule, FooterComponent],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public fallbackTitle: string = 'Portfolio';  // Fallback title

  constructor(
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
  }
}
