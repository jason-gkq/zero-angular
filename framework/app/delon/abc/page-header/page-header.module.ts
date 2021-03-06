import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DelonUtilModule } from '@delon/util';

import { PageHeaderComponent } from './page-header.component';
import { AdPageHeaderConfig } from './page-header.config';

const COMPONENTS = [PageHeaderComponent];

// region: zorro modules

import { NgZorroAntdModule } from 'app/ng-zorro-antd.module';

const ZORROMODULES = [NgZorroAntdModule];

// endregion

@NgModule({
  imports: [CommonModule, RouterModule, DelonUtilModule, ...ZORROMODULES],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class AdPageHeaderModule {
  static forRoot(): ModuleWithProviders<AdPageHeaderModule> {
    return { ngModule: AdPageHeaderModule, providers: [AdPageHeaderConfig] };
  }
}
