import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { LayoutDefaultComponent } from './default/default.component';
import { LayoutFullScreenComponent } from './fullscreen/fullscreen.component';
import { HeaderComponent } from './default/header/header.component';
import { SidebarComponent } from './default/sidebar/sidebar.component';
import { HeaderSearchComponent } from './default/header/components/search.component';
import { HeaderNotifyComponent } from './default/header/components/notify.component';
import { HeaderFullScreenComponent } from './default/header/components/fullscreen.component';
import { HeaderI18nComponent } from './default/header/components/i18n.component';
import { LayoutThemeAComponent } from './theme-a/theme-a.component';
import { HeaderThemeAComponent } from './theme-a/header/header.component';
import { SidebarThemeAComponent } from './theme-a/sidebar/sidebar.component';
import { SideBarMenuComponent } from './shared/sidebar/sidebar-menu/sidebar-menu.component';
import { HeaderBackgroundServiceComponent } from './shared/header/background-service.component';
import { HeaderCheckDownloadComponent } from './shared/header/check-download.component';
import { HeaderUserComponent } from './shared/header/user.component';
import { HeaderStoreSwitchComponent } from './shared/header/store-switch.component';

const COMPONENTS = [
    LayoutDefaultComponent,
    LayoutFullScreenComponent,
    HeaderComponent,
    SidebarComponent,
    SideBarMenuComponent,
    LayoutThemeAComponent,
    HeaderThemeAComponent,
    SidebarThemeAComponent
];

const HEADERCOMPONENTS = [
    HeaderSearchComponent,
    HeaderNotifyComponent,
    HeaderFullScreenComponent,
    HeaderI18nComponent,
    HeaderUserComponent,
    HeaderStoreSwitchComponent,
    HeaderBackgroundServiceComponent,
    HeaderCheckDownloadComponent
];

// passport
import { LayoutAuthComponent } from './auth/passport.component';

const PASSPORT = [
    LayoutAuthComponent
];

@NgModule({
    imports: [SharedModule],
    providers: [],
    declarations: [
        ...COMPONENTS,
        ...HEADERCOMPONENTS,
        ...PASSPORT
    ],
    exports: [
        ...COMPONENTS,
        ...PASSPORT
    ]
})
export class LayoutModule { }
