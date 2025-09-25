import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[UiOverrideColumn]',
  standalone: false,
})
export class UiOverrideColumnDirective {
  @Input('UiOverrideColumn') field!: string;

  constructor(public template: TemplateRef<any>) {}
  @Input() public uiOverrideColumnOverrideSortHeader?: string;
}