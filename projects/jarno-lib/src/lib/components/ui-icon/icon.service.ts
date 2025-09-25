import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private registeredIcons = new Set<string>();
  private iconStatus$ = new BehaviorSubject<Set<string>>(this.registeredIcons);
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
  }


  registerIcons(directory: string, iconNames: string[]): void {
    iconNames.forEach(iconName => {
      if (!this.registeredIcons.has(iconName)) {
        this.matIconRegistry.addSvgIcon(
          iconName,
          this.domSanitizer.bypassSecurityTrustResourceUrl(`${directory}/${iconName}.svg`)
        );
        this.registeredIcons.add(iconName);
      }
    });
    this.iconStatus$.next(new Set(this.registeredIcons));
  }

  /**
   * Returns an observable that emits true when a given icon is registered
   */
  iconReady$(iconName: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const check = () => {
        if (this.registeredIcons.has(iconName)) {
          observer.next(true);
          observer.complete();
        }
      };
      check();
      const sub = this.iconStatus$.subscribe(() => check());
      return () => sub.unsubscribe();
    });
  }
}