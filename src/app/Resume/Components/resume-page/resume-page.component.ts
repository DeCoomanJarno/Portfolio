import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ResumeData } from '../../Models/ResumeData.model';
import { ResumeService } from '../../Services/resume.service';
import { LanguageService } from '../../../Core/Services/language.service';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [],
  templateUrl: './resume-page.component.html',
  styleUrls: ['./resume-page.component.css']
})
export class ResumePageComponent implements OnInit {
  resumeData: ResumeData | undefined;

  constructor(
    private resumeService: ResumeService, 
    public languageService: LanguageService, 
    public commonDataService: CommonDataService
  ) { }

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
  @ViewChild('resumeContent', { static: false }) resumeContent!: ElementRef;

  downloadResumePDF() {
    if (this.resumeContent) {
      const element = this.resumeContent.nativeElement;

    // Haal de exacte breedte en hoogte van je element op
    
    // Calculate shrink factor: 210mm / 300mm = 0.7
    const shrink = 210 / 300;

    // Temporarily scale down
    element.style.transform = `scale(${shrink})`;
    element.style.transformOrigin = 'top left';
    element.style.width = `300mm`; // fix width so it doesn't overflow
  
const options = {
  margin: 0,
  filename: 'Mijn_CV.pdf',
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  enableLinks: true,
  html2canvas: {
    scale: 3, // render at 3x resolution for sharpness
    useCORS: true
  },
  pagebreak: { mode: ['css', 'legacy'] }
};


    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        // Reset scaling after PDF is done
        element.style.transform = '';
        element.style.width = '300mm';
      });
  }
}
}