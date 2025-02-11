import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface CommonData {
  FullName: string;

  Name: string;
  FirstName: string;
  ProfileImage: string;
  Logo: string;
  Contact: {
    Email: string;
    Phone: string;
  };
  Website: string;
  LinkedIn_URL: string;
  Github_URL: string;
}
@Injectable({
  providedIn: 'root'
})
export class CommonDataService{
  public CommonData: CommonData | undefined;
  private dataUrl = `Resources/Json/CommonData.json`; // Path to your JSON file

  constructor(private http: HttpClient) {
    this.getCommonData().subscribe(data => this.CommonData = data);
   }

  // Method to fetch the common data from JSON
  private getCommonData(): Observable<CommonData> {
    return this.http.get<CommonData>(this.dataUrl).pipe(
      // Map the response to add FullName field
      map(data => {
        data.FullName = `${data.FirstName} ${data.Name}`;
        return data;
      })
    );
  }
}
