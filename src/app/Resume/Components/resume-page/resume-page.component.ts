import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ResumeService } from '../../Services/resume.service';
import { CommonDataService } from '../../../Core/Services/common-data.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-resume-page',
  templateUrl: './resume-page.component.html',
  styleUrls: ['./resume-page.component.css'],
  imports: [TranslateModule, AsyncPipe]
})
export class ResumePageComponent {
  public resumeData$;
  @ViewChild('resumeContent', { static: false }) resumeContent!: ElementRef;

  constructor(
    private resumeService: ResumeService,
    public commonDataService: CommonDataService
  ) { 
    this.resumeData$ = this.resumeService.resumeData$;}
downloadResumePDF() {
   const element = this.resumeContent.nativeElement;
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '210mm';  // A4 width
    iframe.style.height = '297mm'; // A4 height
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert('Could not create PDF iframe.');
      return;
    }
    // Clone the resume content HTML
    const clonedContent = element.cloneNode(true) as HTMLElement;
    // Prepare styles: clone all stylesheets and inline styles
    let styles = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.cssRules) {
          for (const rule of Array.from(sheet.cssRules)) {
            styles += rule.cssText;
          }
        }
      } catch (e) {
        // Ignore CORS errors for external stylesheets
      }
    }
// Apply computed colors for dark/light mode
const entries = clonedContent.querySelectorAll<HTMLElement>('.Entry');
entries.forEach(entry => {
  const color = getComputedStyle(entry).color;
  entry.style.color = color;
});

const entrieheaders = clonedContent.querySelectorAll<HTMLElement>('.Degree');
entries.forEach(entry => {
  const color = getComputedStyle(entry).color;
  entry.style.color = color;
});

const descriptions = clonedContent.querySelectorAll<HTMLElement>('.Description');
descriptions.forEach(desc => {
  const color = getComputedStyle(desc).color;
  desc.style.color = color;
});

// Skill badges
const badges = clonedContent.querySelectorAll<HTMLElement>('.badge');
badges.forEach(badge => {
  const color = getComputedStyle(badge).color;
  badge.style.color = color;
});


    const bodyClass = document.body.className;
    // Write the iframe document with styles and cloned content
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" rel="stylesheet" />

  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
          <title>Resume PDF</title>
          <style>

            /* Inject all styles */
            ${styles}
            /* Force A4 size and remove margins */
            @page {
              size: A4;
              margin: 10mm;
            }
            /* Set body and html to A4 size */
           html, body {
  width: 280mm;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  font-family: inherit;
}

  /* Preserve main background and text color */
  body, .resume-wrapper, .resume {
    background: ${getComputedStyle(document.body).backgroundColor};
    color: ${getComputedStyle(document.body).color};
  }

  /* ===== Entries and Descriptions ===== */
  .Entry, .Description, .EntryHeader, .Degree {
    color: ${getComputedStyle(document.querySelector('.Entry') as HTMLElement)?.color || '#000'};
  }
  .Degree {
    color: ${getComputedStyle(document.querySelector('.Degree') as HTMLElement)?.color || '#000'};
  }



  /* Skill badges */
  .badge {
    color: ${getComputedStyle(document.querySelector('.badge') as HTMLElement)?.color || '#fff'};
  }

  /* Links */
  a {
    color: ${getComputedStyle(document.body).color};
  }

  /* Optional: adjust headers if needed */
  .Header, .RightSide .Company, .RightSide .Location, .Year {
    color: ${getComputedStyle(document.querySelector('.Header') as HTMLElement)?.color || '#000'};
  }

  /* Force printing colors correctly */
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
          </style>
        </head>
        <body class="${bodyClass}">
          <div >
            ${clonedContent.outerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();
    // Wait for iframe content to load before printing
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      // Trigger print dialog programmatically
      iframe.contentWindow?.print();
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
    // Fallback: if onload doesn't fire, trigger print after delay
    setTimeout(() => {
      iframe.contentWindow?.focus();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 1500);
  }
}