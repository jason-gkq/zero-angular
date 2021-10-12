import { Component } from '@angular/core';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    searchToggleStatus: boolean;
    env = <any>environment;
    constructor(public settings: SettingsService, public routerService: LcbRouterService) {
    }

    toggleCollapsedSidebar() {
        this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
    }

    searchToggleChange() {
        this.searchToggleStatus = !this.searchToggleStatus;
    }

}
