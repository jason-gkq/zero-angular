import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
})
export class DelonUtilModule {
  static forRoot(): ModuleWithProviders<DelonUtilModule> {
    return {
      ngModule: DelonUtilModule,
    };
  }
}
