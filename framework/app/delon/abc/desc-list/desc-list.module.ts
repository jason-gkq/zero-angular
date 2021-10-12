import { NgZorroAntdModule } from 'app/ng-zorro-antd.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObserversModule } from '@angular/cdk/observers';

import { DescListComponent } from './desc-list.component';
import { DescListItemComponent } from './desc-list-item.component';
import { AdDescListConfig } from './desc-list.config';

const COMPONENTS = [DescListComponent, DescListItemComponent];

@NgModule({
  imports: [CommonModule, NgZorroAntdModule, ObserversModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})
export class AdDescListModule {
  static forRoot(): ModuleWithProviders<AdDescListModule> {
    return { ngModule: AdDescListModule, providers: [AdDescListConfig] };
  }
}
