import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ResumeData } from '../../Models/ResumeData.model';
import { ResumeService } from '../../Services/resume.service';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [],
  templateUrl: './resume-page.component.html',
  styleUrls: ['./resume-page.component.css']
})
export class ResumePageComponent implements OnInit {
resumeData: ResumeData | undefined;

constructor(private resumeService: ResumeService) {}

ngOnInit() {
  this.resumeService.getResumeData().subscribe(
    data => {
      this.resumeData = data;
    },
    error => {
      console.error('Error loading resume data:', error);
    }
  );
}
}