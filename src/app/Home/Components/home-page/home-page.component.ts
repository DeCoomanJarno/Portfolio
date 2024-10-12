import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../../Core/Services/language.service';
import { ProjectItemComponent } from '../../../Project/Components/project-item/project-item.component';
import { ProjectModel } from '../../../Project/Models/project-model';
import { ProjectService } from '../../../Project/Services/project-service';
import { RouterLink } from '@angular/router';
import { HomeModel } from '../../Models/home-model';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Contact } from '../../../Resume/Models/ResumeData.model';
import { ResumeService } from '../../../Resume/Services/resume.service';

export function mergeDeep(target: any, source: any): any {
  const isObject = (obj: any) => obj && typeof obj === 'object';

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(sourceValue)) {
      target[key] = sourceValue;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep({ ...targetValue }, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ProjectItemComponent, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  homeData:HomeModel | undefined;
  projects: ProjectModel[] = [];
  contact: Contact | undefined;

  constructor(
    public languageService: LanguageService,
    private projectService: ProjectService,
    private resumeService: ResumeService,
    private http: HttpClient // Injecting HttpClient for fetching JSON
  ) {}

  ngOnInit(): void {
    this.LoadHomeData();
    this.LoadContact();
    // Fetch projects from the service
    this.projectService.getProjects().subscribe((data: ProjectModel[]) => {
      // Filter projects based on the IDs in homeData.Projects
      this.projects = data.filter(pr => 
        this.homeData?.Projects.some(project => project === pr.id)
      );
    });
  }

  navigateToResume() {
    window.location.href = '/resume';
  }

  // Load home data for the current language, with fallback to English
  LoadHomeData() {
    this.languageService.currentLanguage$.subscribe(lang => {
      const enUrl = `Resources/Json/${this.languageService.defaultLang}/Home_${this.languageService.defaultLang}.json`;
      const localizedUrl = `Resources/Json/${lang}/Home_${lang}.json`;

      // Load both English and localized JSON files
      forkJoin({
        en: this.http.get<HomeModel>(enUrl),
        localized: this.http.get<HomeModel>(localizedUrl)
      }).subscribe(({ en, localized }) => {
        // Merge localized data with English fallback
        this.homeData = mergeDeep(en, localized);
      });
    });
  }

  LoadContact()
  {
    this.languageService.currentLanguage$.subscribe(lang => this.resumeService.getResumeData(lang).subscribe(data => this.contact = data.Contact))

  }
}
