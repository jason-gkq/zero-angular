import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SettingsService } from '../../delon/theme';



@Component({
    templateUrl: './theme-a.component.html',
    styleUrls: ['./theme-a.component.less']
})

export class LayoutThemeAComponent implements OnInit {
    triggerTemplate = null;

    constructor(
        public settings: SettingsService
    ) {

    }

    ngOnInit() {
    }

}
