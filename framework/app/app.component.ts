import { Component, HostBinding, OnInit } from '@angular/core';
import { DictionaryService } from '@core/common/dictionary.service';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';

@Component({
    selector: 'app-root',
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {

    @HostBinding('class.layout-fixed') get isFixed() { return this.settings.layout.fixed; }
    @HostBinding('class.layout-boxed') get isBoxed() { return this.settings.layout.boxed; }
    @HostBinding('class.aside-collapsed') get isCollapsed() { return this.settings.layout.collapsed; }

    constructor(
        private settings: SettingsService,
        private lcbRouterSrv: LcbRouterService,
        private dictionary: DictionaryService,
    ) {
    }

    ngOnInit() {
        this.dictionary.getItems(environment.dictionaryCodes);

        this.lcbRouterSrv.loadRouting();
    }

}
