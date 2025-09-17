import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { ResumeData } from '../Models/ResumeData.model';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private resumeDataSubject = new BehaviorSubject<ResumeData | null>(null);
  resumeData$ = this.resumeDataSubject.asObservable();

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.loadData();
    this.translate.onLangChange.subscribe(() => this.loadData());
  }

  private loadData() {
    this.http.get<ResumeData>('Resources/Json/resume.json').pipe(
      catchError(() => of({} as ResumeData)),
      map(data => this.enhanceResumeData(data))
    ).subscribe(data => this.resumeDataSubject.next(data));
  }

  private enhanceResumeData(data: ResumeData): ResumeData {
    // Format Education dates
    data.Education.forEach(edu => {
      edu['FormattedDates'] = this.formatDateRange(edu.StartDate, edu.EndDate);
      edu['Duration'] = this.getDuration(edu.StartDate, edu.EndDate);
    });

    // Format Experience dates
    data.Experience.forEach(exp => {
      exp['FormattedDates'] = this.formatDateRange(exp.StartDate, exp.EndDate);
      exp['Duration'] = this.getDuration(exp.StartDate, exp.EndDate);
    });

    // Format skill years
    data.Skills.ProgrammingLanguages.forEach(skill => {
      skill.Experience['FormattedSchool'] = skill.Experience.School ? this.formatSkillYears(skill.Experience.School) : '';
      skill.Experience['FormattedWork'] = skill.Experience.Work ? this.formatSkillYears(skill.Experience.Work) : '';
      skill.Experience['FormattedHobby'] = skill.Experience.Hobby ? this.formatSkillYears(skill.Experience.Hobby) : '';
    });

    return data;
  }

  private parseYearMonth(ym?: string | null): Date | null {
    if (!ym) return null;
    const [y, m] = ym.split('-');
    const year = Number(y);
    const month = m ? Number(m) - 1 : 0;
    if (isNaN(year) || (m && isNaN(month))) return null;
    return new Date(year, month, 1);
  }

  private formatDateRange(start?: string | null, end?: string | null): string {
    const s = this.parseYearMonth(start);
    const e = end ? this.parseYearMonth(end) : null;
    const endIsNow = !end || end === null;

    const fmt = (d: Date) =>
      new Intl.DateTimeFormat(this.translate.getCurrentLang() || 'en', { year: 'numeric', month: 'short' }).format(d);

    if (!s && !e) return '';
    if (s && endIsNow) return `${fmt(s)} — ${this.translate.instant('resume.now')}`;
    if (s && e) return `${fmt(s)} — ${fmt(e!)}`;
    if (!s && e) return fmt(e!);
    return '';
  }

  private getDuration(start?: string | null, end?: string | null): string {
    const s = this.parseYearMonth(start);
    const e = end ? this.parseYearMonth(end) : new Date();
    if (!s || !e) return '';

    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months < 0) months = 0;

    const years = Math.floor(months / 12);
    const remMonths = months % 12;

    const parts: string[] = [];
    if (years > 0)
      parts.push(`${years} ${this.translate.instant('resume.yearShort')}`);
    if (remMonths > 0)
      parts.push(`${remMonths} ${this.translate.instant('resume.monthShort')}`);

    return parts.join(' ');
  }

  private formatSkillYears(years?: number): string {
    if (!years || years <= 0) return '';
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);

    const parts: string[] = [];
    if (wholeYears > 0)
      parts.push(`${wholeYears} ${this.translate.instant('resume.yearShort')}`);
    if (months > 0)
      parts.push(`${months} ${this.translate.instant('resume.monthShort')}`);

    return parts.join(' ');
  }
}
