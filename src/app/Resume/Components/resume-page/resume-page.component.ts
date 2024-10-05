import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ResumeData } from '../../Models/ResumeData.model';
import { ResumeService } from '../../Services/resume.service';
import { LanguageService } from '../../../Core/Services/language.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [],
  templateUrl: './resume-page.component.html',
  styleUrls: ['./resume-page.component.css']
})
export class ResumePageComponent implements OnInit {
  resumeData: ResumeData | undefined;

  constructor(private resumeService: ResumeService, public languageService: LanguageService) { }

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
    const resumeElement = this.resumeContent.nativeElement;

    html2canvas(resumeElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${this.resumeData!.FirstName}_${this.resumeData!.Name}_${this.languageService.getTranslation('Resume')}.pdf`);
    });
  }
}