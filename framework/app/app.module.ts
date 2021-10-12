import { NgModule, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import {
    HttpClient,
    HTTP_INTERCEPTORS,
    HttpClientModule,
    HttpClientJsonpModule
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DelonModule } from './delon.module';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { StartupService } from '@core/startup/startup.service';
import { DefaultInterceptor } from '@core/net/default.interceptor';
// angular i18n
import { registerLocaleData, APP_BASE_HREF } from '@angular/common';
import localeZh from '@angular/common/locales/zh';
// import localeEs from '@angular/common/locales/es';
registerLocaleData(localeZh);
// i18n
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core/i18n/i18n.service';

import { AppRoutingModule } from './app-routing.module';
import { environment } from '@env/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    if (environment.ENV === 'local') {
        return new TranslateHttpLoader(http, `assets/i18n/`, '.json');
    } else {
        return new TranslateHttpLoader(http, `${environment.appId}/assets/i18n/`, '.json');
    }
}

export function StartupServiceFactory(
    startupService: StartupService
): Function {
    return () => startupService.load();
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        DelonModule.forRoot(),
        CoreModule,
        SharedModule,
        LayoutModule,
        AppRoutingModule,
        // i18n
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: LOCALE_ID, useValue: 'zh' },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: DefaultInterceptor,
            multi: true
        },
        { provide: ALAIN_I18N_TOKEN, useClass: I18NService, multi: false },
        StartupService,
        {
            provide: APP_INITIALIZER,
            useFactory: StartupServiceFactory,
            deps: [StartupService],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
