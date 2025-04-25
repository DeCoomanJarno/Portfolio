import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ResumeData } from '../../Models/ResumeData.model';
import { ResumeService } from '../../Services/resume.service';
import { LanguageService } from '../../../Core/Services/language.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import domtoimage from 'dom-to-image';

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
    if (!this.resumeData) {
      console.warn('Resume data not loaded');
      return;
    }

    const resumeElement = this.resumeContent.nativeElement;

    domtoimage
    .toPng(resumeElement, {
      quality: 1,
      bgcolor: '#ffffff',
      width: resumeElement.offsetWidth,
      height: resumeElement.offsetHeight
    }).then((dataUrl) => {
      const pdf = new jsPDF.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (resumeElement.offsetHeight * imgWidth) / resumeElement.offsetWidth;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

while (heightLeft > 0) {
  pdf.addPage();
  position = heightLeft - imgHeight;
  pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
}
pdf.save(
        `${this.commonDataService.CommonData?.FirstName}_${this.commonDataService.CommonData?.Name}_${this.languageService.getTranslation('Resume')}.pdf`
      );
    })
      .catch((error) => {
        console.error('Error generating image:', error);
      }); }
}