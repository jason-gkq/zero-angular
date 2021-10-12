import { ErrorHandler, NgModule, Optional, SkipSelf } from '@angular/core';
// 表格跨页多选
import { MultipleCheckedService } from '@core/common/multiple-checked.service';
// 路由守卫
import { AuthGuardService } from './auth/auth-guard.service';
// 权限
import { AuthService } from './auth/auth.service';
import { CanDeactivateGuard } from './auth/can-deactivate-guard.service';
// cache
import { CookieService } from './cache/cookie.service';
import { LocalStorageService } from './cache/local-storage.service';
import { SessionStorageService } from './cache/session-storage.service';
// 数据字典
import { DictionaryService } from './common/dictionary.service';
import { GlobalErrorHandler } from './common/global-error-handler';
import { I18NService } from './i18n/i18n.service';
// router 跳转
import { LcbRouterService } from './lcb-router/lcb-router.service';
// 菜单服务
import { LcbMenuService } from './menu/lcb-menu.service';
import { MessageService } from './message/message.service';
import { throwIfAlreadyLoaded } from './module-import-guard';
// log
import { UbtService } from './ubt/ubt.service';
// 用户信息
import { UserService } from './user/user.service';
import { UtilsService } from './utils/utils.service';

@NgModule({
    providers: [
        CookieService,
        SessionStorageService,
        LocalStorageService,
        UbtService,
        LcbRouterService,
        UserService,
        AuthService,
        CanDeactivateGuard,
        AuthGuardService,
        LcbMenuService,
        DictionaryService,
        MessageService,
        I18NService,
        UtilsService,
        MultipleCheckedService,
        { provide: ErrorHandler, useClass: GlobalErrorHandler }
    ]
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, 'CoreModule');
    }
}
