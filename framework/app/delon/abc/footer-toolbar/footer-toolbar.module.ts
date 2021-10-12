import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FooterToolbarComponent } from './footer-toolbar.component';

const COMPONENTS = [FooterToolbarComponent];

@NgModule({
  imports: [CommonModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class AdFooterToolbarModule {
  static forRoot(): ModuleWithProviders<AdFooterToolbarModule> {
    return { ngModule: AdFooterToolbarModule, providers: [] };
  }
}
