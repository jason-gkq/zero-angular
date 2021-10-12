import { NgModule, ModuleWithProviders } from '@angular/core';

// region: all modules
import { AdFooterToolbarModule } from './footer-toolbar/footer-toolbar.module';
import { AdDownFileModule } from './down-file/down-file.module';
import { AdDescListModule } from './desc-list/desc-list.module';
import { AdEllipsisModule } from './ellipsis/ellipsis.module';
import { AdGlobalFooterModule } from './global-footer/global-footer.module';
import { AdExceptionModule } from './exception/exception.module';
import { AdNoticeIconModule } from './notice-icon/notice-icon.module';
import { AdPageHeaderModule } from './page-header/page-header.module';
import { AdReuseTabModule } from './reuse-tab/reuse-tab.module';

const MODULES = [
  AdFooterToolbarModule,
  AdDownFileModule,
  AdDescListModule,
  AdEllipsisModule,
  AdGlobalFooterModule,
  AdExceptionModule,
  AdNoticeIconModule,
  AdPageHeaderModule,
  AdReuseTabModule,
];

// endregion

@NgModule({
  imports: [
    AdFooterToolbarModule.forRoot(),
    AdDownFileModule.forRoot(),
    AdDescListModule.forRoot(),
    AdEllipsisModule.forRoot(),
    AdGlobalFooterModule.forRoot(),
    AdExceptionModule.forRoot(),
    AdNoticeIconModule.forRoot(),
    AdPageHeaderModule.forRoot(),
    AdReuseTabModule.forRoot(),
  ],
  exports: MODULES,
})
export class DelonABCRootModule { }

@NgModule({ exports: MODULES })
export class DelonABCModule {
  static forRoot(): ModuleWithProviders<DelonABCRootModule> {
    return { ngModule: DelonABCRootModule };
  }
}
