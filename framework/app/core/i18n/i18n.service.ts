import { Injectable, LOCALE_ID, Injector } from '@angular/core';
import { AlainI18NService, SettingsService } from '@delon/theme';
import { TranslateService } from '@ngx-translate/core';
import * as df_en from 'ng-zorro-antd/i18n';
import * as df_zh_cn from 'ng-zorro-antd/i18n';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class I18NService implements AlainI18NService {
    private _default = 'zh-CN';
    private change$ = new BehaviorSubject<string>(null);

    private _langs = [
        { code: 'zh-CN', text: '中文' },
        { code: 'en-US', text: 'English' }
    ];

    constructor(
        private settings: SettingsService,
        private nzI18nService: NzI18nService,
        private translate: TranslateService,
        private injector: Injector
    ) {
        // const defaultLan = settings.layout.lang || translate.getBrowserLang();
        // const lans = this._langs.map(item => item.code);
        // this._default = lans.includes(defaultLan) ? defaultLan : lans[0];
        // translate.addLangs(lans);
        // this.setZorro(this._default).setDateFns(this._default);
    }

    setZorro(lang: string): this {
        this.nzI18nService.setLocale(lang === 'en-US' ? en_US : zh_CN);
        return this;
    }

    setDateFns(lang: string): this {
        (window as any).__locale__ = lang === 'en-US' ? df_en : df_zh_cn;
        return this;
    }

    get change(): Observable<string> {
        return this.change$.asObservable().pipe(filter(w => w != null));
    }

    use(lang: string): void {
        lang = lang || this.translate.getDefaultLang();
        if (this.currentLang === lang) return;
        this.setZorro(lang).setDateFns(lang);
        this.translate.use(lang).subscribe(() => this.change$.next(lang));
        console.log('i18n::::', this.settings, lang, this.translate);
    }
    /** 获取语言列表 */
    getLangs() {
        return this._langs;
    }
    /** 翻译 */
    fanyi(key: string) {
        return this.translate.instant(key);
    }
    /** 默认语言 */
    get defaultLang() {
        return this._default;
    }
    /** 当前语言 */
    get currentLang() {
        return this.translate.currentLang || this.translate.getDefaultLang() || this._default;
    }
}
