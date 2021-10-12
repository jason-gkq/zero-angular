import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { environment } from '../../environments/main';

import { AuthGuardService } from '@core/auth/auth-guard.service';
// layout
import { LayoutDefaultComponent } from './layout/default/default.component';
import { LayoutFullScreenComponent } from './layout/fullscreen/fullscreen.component';
import { LayoutAuthComponent } from './layout/auth/passport.component';
import { LayoutThemeAComponent } from './layout/theme-a/theme-a.component';

// auth
import { AuthLoginComponent } from '@shared/auth/login/login.component';
import { AuthForgetPwdComponent } from '@shared/auth/forgetPwd/forgetPwd.component';

// passport
import { UserLogoutComponent } from '@shared/passport/logout/logout.component';

// =====================================
// single pages
// import {CallbackComponent} from '../../pages/callback/callback.component';
import { Exception403Component } from '@shared/exception/403.component';
import { Exception404Component } from '@shared/exception/404.component';
import { Exception500Component } from '@shared/exception/500.component';

const routes: Routes = [
    // passport
    {
        path: `user`,
        component: LayoutAuthComponent,
        children: [
            { path: 'login', component: AuthLoginComponent, data: { title: '登录' } },
            { path: 'forgetPwd', component: AuthForgetPwdComponent, data: { title: '忘记密码' } },
            { path: 'logout', component: UserLogoutComponent, data: { title: '退出登录' } }
        ]
    },
    {
        path: `common/user`,
        component: LayoutAuthComponent,
        children: [
            { path: 'login', component: AuthLoginComponent, data: { title: '登录' } },
            { path: 'forgetPwd', component: AuthForgetPwdComponent, data: { title: '忘记密码' } },
            { path: 'logout', component: UserLogoutComponent, data: { title: '退出登录' } }
        ]
    },
    // 全屏布局
    {
        path: environment.appId + '/full',
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],
        component: LayoutFullScreenComponent,
        children: [
            { path: '', loadChildren: () => import('../../pages/pages.module').then(m => m.PagesModule) }
        ]
    },
    {
        path: environment.appId,
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],
        component: (environment.theme === 'A' ? LayoutThemeAComponent : LayoutDefaultComponent),
        children: [
            { path: '', loadChildren: () => import('../../pages/pages.module').then(m => m.PagesModule) }
        ]
    },
    { path: '403', component: Exception403Component, data: { title: '403' } },
    { path: '404', component: Exception404Component, data: { title: '404' } },
    { path: '500', component: Exception500Component, data: { title: '500' } },
    { path: '', redirectTo: environment.defaultHome, pathMatch: 'full' },
    // Not lazy-loaded routes
    { path: '**', component: Exception404Component }
];


// switch (layoutStyle) {
//     case 'A':
// routes.splice(2, 0, {
//     path: environment.appId,
//     canActivate: [AuthGuardService],
//     canActivateChild: [AuthGuardService],
//     component: LayoutThemeAComponent,
//     children: [
//         { path: '', loadChildren: '../../pages/pages.module#PagesModule' }
//     ]
// });
//         break;
//     default:
//         routes.splice(2, 0, {
//             path: environment.appId,
//             canActivate: [AuthGuardService],
//             canActivateChild: [AuthGuardService],
//             component: LayoutDefaultComponent,
//             children: [
//                 { path: '', loadChildren: '../../pages/pages.module#PagesModule' }
//             ]
//         });
// }
// 单页不包裹Layout
// {path: 'callback/:type', component: CallbackComponent},


@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            relativeLinkResolution: 'legacy'
        })
    ],
    // providers: [
    //     {
    //         provide: AuthGuardService, useValue: (route: Route) => route.data.theme === environment.theme
    //     }
    // ],
    declarations: [],
    exports: [RouterModule]
})
export class AppRoutingModule {
    constructor() {
    }
}
