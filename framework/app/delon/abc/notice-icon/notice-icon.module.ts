import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoticeIconComponent } from './notice-icon.component';
import { NoticeIconTabComponent } from './notice-icon-tab.component';
import { NgZorroAntdModule } from 'app/ng-zorro-antd.module';

const COMPONENTS = [NoticeIconComponent];

// region: zorro modules


const ZORROMODULES = [NgZorroAntdModule];

// endregion

@NgModule({
  imports: [CommonModule, ...ZORROMODULES],
  declarations: [...COMPONENTS, NoticeIconTabComponent],
  exports: [...COMPONENTS],
})
export class AdNoticeIconModule {
  static forRoot(): ModuleWithProviders<AdNoticeIconModule> {
    return { ngModule: AdNoticeIconModule, providers: [] };
  }
}
