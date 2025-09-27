import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, take } from 'rxjs';

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
  return this.iconStatus$.pipe(
    map(icons => icons.has(iconName)),
    distinctUntilChanged(),
    filter(isReady => isReady),
    take(1) // complete after first `true`
  );
}
}