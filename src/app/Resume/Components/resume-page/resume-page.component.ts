import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ResumeData } from '../../Models/ResumeData.model';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [],
  templateUrl: './resume-page.component.html',
  styleUrls: ['./resume-page.component.css']
})
export class ResumePageComponent implements OnInit {
[x: string]: any;
  resumeData: ResumeData | undefined;  // Use your model here

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<ResumeData>('Resources/Resume.json')  // Specify the type as Resume
      .subscribe(data => {
        this.resumeData = data;
      }, error => {
        console.error('Error loading resume data', error);
      });
  }
}