import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Skill{
  Name: string;
  Level: string;
  IconUrl: string;
}

export interface Certificates{
  Title: string;
  Issuer: string;
  Date: string;
  Url?: string;
}
export interface SkillCategorie{
  Name: string;
  Icon: string;
  Skills: Skill[]
}

export interface CommonData {
  home: {
    projects: string[];
  };
  FullName: string;
  Name: string;
  FirstName: string;
  ProfileImage: string;
  Logo: string;
  LogoSvg: string;
  LogoSvgOutlined: string;
  Contact: {
    Email: string;
    Phone: string;
  };
  Website: string;
  LinkedIn_URL: string;
  Github_URL: string;
  SkillCategories: SkillCategorie[];
  Certificates: Certificates[];
}

@Injectable({
  providedIn: 'root'
})
export class CommonDataService {
  private dataUrl = `Resources/Json/CommonData.json`;

  // BehaviorSubject allows components to subscribe and get the latest value
  private commonDataSubject = new BehaviorSubject<CommonData | null>(null);
  public commonData$ = this.commonDataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCommonData();
  }

  // Load JSON data and emit it through the BehaviorSubject
  private loadCommonData(): void {
    this.http.get<CommonData>(this.dataUrl)
      .pipe(
        map(data => {
          data.FullName = `${data.FirstName} ${data.Name}`;
          data.LogoSvgOutlined = `${data.Logo}-Outlined.svg`;
          data.LogoSvg = `${data.Logo}.svg`;
          data.Logo = `${data.Logo}.png`;
          return data;
        }),
        tap(data => this.commonDataSubject.next(data))
      )
      .subscribe();
  }

  // Optional helper to get the current value synchronously
  get CommonData(): CommonData | null {
    return this.commonDataSubject.value;
  }
}
