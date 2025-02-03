import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'icon',
  standalone: true
})
export class IconPipe implements PipeTransform {
  
  transform(technology: string): string {
    if(technology == "C#")
      return `Resources/Icons/CSharp.svg`;
    return `Resources/Icons/${technology}.svg`;
  }
}
