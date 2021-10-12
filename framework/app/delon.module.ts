/**
 * 进一步对基础模块的导入提炼
 * 有关模块注册指导原则请参考：https://github.com/cipchk/ng-alain/issues/180
 */
import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { throwIfAlreadyLoaded } from '@core/module-import-guard';

import { NgZorroAntdModule } from 'app/ng-zorro-antd.module';
import { AlainThemeModule } from '@delon/theme';
import { DelonABCModule, ReuseTabService, ReuseTabStrategy } from '@delon/abc';
import { DelonUtilModule } from '@delon/util';
// mock
import { DelonMockModule } from '@delon/mock';
import * as MOCKDATA from '../../_mock';
import { environment } from '@env/environment';

const MOCKMODULE = !environment.production ? [DelonMockModule.forRoot({ data: MOCKDATA })] : [];

// region: global config functions

import { AdPageHeaderConfig } from '@delon/abc';


export function pageHeaderConfig(): AdPageHeaderConfig {
    return Object.assign(new AdPageHeaderConfig(), { home_i18n: 'home', autoTitle: false });
}

// endregion

@NgModule({
    imports: [
        NgZorroAntdModule,
        AlainThemeModule.forRoot(),
        DelonABCModule.forRoot(),
        DelonUtilModule.forRoot(),
        // mock
        ...MOCKMODULE
    ]
})
export class DelonModule {
    constructor(@Optional() @SkipSelf() parentModule: DelonModule) {
        throwIfAlreadyLoaded(parentModule, 'DelonModule');
    }

    static forRoot(): ModuleWithProviders<DelonModule> {
        return {
            ngModule: DelonModule,
            providers: [
                // TIPS：若不需要路由复用需要移除以下代码及模板`<reuse-tab></reuse-tab>`
                // {
                //     provide: RouteReuseStrategy,
                //     useClass: ReuseTabStrategy,
                //     deps: [ReuseTabService],
                // },
                // TIPS：@delon/abc 有大量的全局配置信息，例如设置所有 `simple-table` 的页码默认为 `20` 行
                // { provide: SimpleTableConfig, useFactory: simpleTableConfig }
                { provide: AdPageHeaderConfig, useFactory: pageHeaderConfig },
            ]
        };
    }
}
