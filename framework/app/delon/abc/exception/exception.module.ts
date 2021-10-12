import { NgZorroAntdModule } from 'app/ng-zorro-antd.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ExceptionComponent } from './exception.component';

const COMPONENTS = [ExceptionComponent];

@NgModule({
  imports: [CommonModule, RouterModule, NgZorroAntdModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class AdExceptionModule {
  static forRoot(): ModuleWithProviders<AdExceptionModule> {
    return { ngModule: AdExceptionModule, providers: [] };
  }
}
