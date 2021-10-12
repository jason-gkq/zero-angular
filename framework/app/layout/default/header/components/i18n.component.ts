import { Component, Inject } from '@angular/core';
import { SettingsService, MenuService, TitleService, ALAIN_I18N_TOKEN } from '@delon/theme';
import { I18NService } from '@core/i18n/i18n.service';

@Component({
    selector: 'header-i18n',
    template: `
    <div nz-dropdown [nzDropdownMenu]="langTpl">
        <i nz-icon nzType="global" nzTheme="outline"></i>
        {{ 'language' | translate}}
        <i nz-icon nzType="down" nzTheme="outline"></i>
    </div>
    <nz-dropdown-menu #langTpl="nzDropdownMenu">
        <ul nz-menu>
            <li nz-menu-item *ngFor="let item of langs"
            [nzSelected]="item.code === settings.layout.lang"
            (click)="change(item.code)">{{item.text}}</li>
        </ul>
    </nz-dropdown-menu>
    `
})
export class HeaderI18nComponent {

    langs: any[];

    constructor(
        public settings: SettingsService,
        @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService
    ) {
        this.langs = this.i18n.getLangs();
    }

    change(lang: string) {
        this.i18n.use(lang);
        this.settings.setLayout('lang', lang);
    }
}
