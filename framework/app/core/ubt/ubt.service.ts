import { environment } from '@env/environment';
import { Injectable, Injector } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import sa from 'sa-sdk-javascript';
import { CookieService } from '../cache/cookie.service';
import { SessionStorageService } from '../cache/session-storage.service';

@Injectable()
export class UbtService {
    constructor(private cookie: CookieService, private session: SessionStorageService, private injector: Injector) {
        console.log('ubt init ----------------->');
        sa.init({
            server_url: 'https://ubt.lechebang.com/sensors/sa.gif?project=' + environment.UBT_PROJECT,
            is_single_page: true,
            show_log: false
        });
        sa.identify(this.getCid(), true);
        sa.quick('autoTrack', this.getLoginInfo());
    }

    saLogin() {
        const currentUser = this.session.get('currentUser');
        sa.login(currentUser.user.id);
    }

    saLogout() {
        sa.logout();
    }
    // 页面跳转事件
    pageView() {
        this.injector
            .get(Router)
            .events.filter(event => event instanceof NavigationEnd) // 筛选原始的Observable：this.router.events
            .subscribe(event => {
                sa.quick('autoTrackSinglePage', this.getLoginInfo());
            });
    }

    // 错误信息发送
    saLogger(data) {
        sa.track(
            'logger',
            Object.assign(
                this.getLoginInfo(),
                {
                    $url: location.href
                },
                data
            )
        );
    }

    private getLoginInfo(): Object {
        const framework = require('../../../../init.json');
        const groupInfo = this.session.get('currentGroupInfo');
        const roleIds = [];
        const roleNames = [];
        if (groupInfo) {
            const roles = groupInfo.roles || [];
            for (const i in roles) {
                roleIds.push(roles[i]['id']);
                roleNames.push(roles[i]['roleName']);
            }
        }
        return {
            platForm: 'angular',
            appCode: String(environment.appCode),
            frameworkVersion: framework['version'],
            groupId: groupInfo ? String(groupInfo.groupId) : '',
            groupType: groupInfo ? groupInfo.groupType : '',
            roleIds: roleIds.join(','),
            roleNames: roleNames.join(',')
        };
    }

    private getCid() {
        let cid = this.cookie.getItem('__clientId');
        if (!cid) {
            cid = this.guid();
            this.cookie.setItem('__clientId', cid, Infinity, '/', this.cookie.getDomain());
        }
        return cid;
    }

    private guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c): string {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
