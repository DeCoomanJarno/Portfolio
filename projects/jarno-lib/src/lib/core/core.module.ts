import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ThemeService, // Optional if you want module-scoped, otherwise use providedIn: 'root'
  ]
})
export class CoreModule {
  // Optional: forRoot pattern if you want singleton services
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [ThemeService],
    };
  }
}
