import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { UserService } from '@core/user/user.service';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'app-themeA-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.less']
})
export class SidebarThemeAComponent implements OnInit {
    env = environment;

    constructor(public settings: SettingsService,
        public msgSrv: NzMessageService,
        public auth: AuthService,
        public routerService: LcbRouterService,
        public userService: UserService) {
        // console.log(document.getElementsByClassName('nav-group-title'));

        // const a = document.getElementsByClassName('nav-group-title');
    }

    ngOnInit() {

    }
}
