import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ResumeData } from '../../Models/ResumeData.model';
import { ResumeService } from '../../Services/resume.service';
import { LanguageService } from '../../../Core/Services/language.service';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [],
  templateUrl: './resume-page.component.html',
  styleUrls: ['./resume-page.component.css']
})
export class ResumePageComponent implements OnInit {
resumeData: ResumeData | undefined;

  constructor(private resumeService: ResumeService, private languageService: LanguageService) {}

  ngOnInit() {
    // Load initial resume data with the default language
    this.loadResumeData(this.languageService.defaultLang);

    // Subscribe to language changes to update resume data
    this.languageService.currentLanguage$.subscribe(lang => {
      this.loadResumeData(lang); // Load resume data whenever the language changes
    });
  }

  loadResumeData(language: string) {
    this.resumeService.getResumeData(language).subscribe(data => {
      this.resumeData = data; // Update resume content with the fetched data
    });
  }
}