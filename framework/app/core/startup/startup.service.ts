import { UbtService } from './../ubt/ubt.service';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService } from '@delon/theme';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from '../cache/cookie.service';
import { SessionStorageService } from '../cache/session-storage.service';
import { I18NService } from '../i18n/i18n.service';

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
    constructor(private menuService: MenuService,
        private translate: TranslateService,
        @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
        private settingService: SettingsService,
        private titleService: TitleService,
        private httpClient: HttpClient,
        private session: SessionStorageService,
        private cookie: CookieService,
        private injector: Injector,
        private ubt: UbtService) {
    }

    load(): Promise<any> {
        this.ubt.pageView();
        const self = this;
        console.log(`initializeApp:: inside promise`);
        // only works with promises
        // https://github.com/angular/angular/issues/15088
        return new Promise((resolve, reject) => {
            this.setDefaultEnvironment();
            console.log(environment);
            // 应用信息：包括站点名、描述、年份
            this.settingService.setApp({
                name: environment.appName,
                description: 'Ng-zorro admin panel front-end framework'
            });
            // this.settingService.setLayout('collapsed', false);
            // this.settingService.setLayout('lang', 'zh-CN');

            // 默认语言包
            // console.log(this.i18n.defaultLang, this.translate.translations);
            // this.translate.setTranslation(this.i18n.defaultLang, { home: '222' });
            // environment.appCode = 600;
            // this.translate.setDefaultLang(this.i18n.defaultLang);
            // this.translate.use(this.i18n.defaultLang);
            // this.translate.reloadLang(this.i18n.defaultLang);
            // 设置页面标题的后缀
            // this.titleService.suffix = environment.appName;
            const flag = self.getCache();
            // console.log(flag);
            if (flag) {
                self.httpClient.post(
                    'gateway/manage/common/api/auth/queryUserAuth',
                    { groupKey: self.getGroupKey() }
                ).subscribe(
                    data => {
                        console.log('->init: ', data);
                        this.session.set('currentUser', data['user']);
                        self.setUser();
                        this.session.set('roles', data['roles']);
                        this.session.set('routerRules', data['routerRules']);
                        // 菜单
                        this.session.set('menus', data['menus']);
                        self.menuService.clear();
                        self.menuService.add(this.session.get('menus'));
                        // 防止关闭浏览器之后打开页面切换的店铺丢失，groupInfo
                        this.session.set('currentGroupInfo', data['groupInfo']);
                        resolve(data);
                    },
                    err => {
                        this.injector.get(Router).navigateByUrl('/user/login');
                        resolve(err);
                    },
                    () => {
                        resolve('');
                    });
            } else {
                self.menuService.clear();
                self.menuService.add(this.session.get('menus'));
                self.setUser();
                resolve('');
            }
        });
    }

    private setUser() {
        const currentUser = this.session.get('currentUser');
        this.ubt.saLogin();
        // 用户信息：包括姓名、头像、邮箱地址
        this.settingService.setUser({
            name: currentUser.user.mobile,
            avatar: currentUser.userInfo.faceImageUrl || './assets/img/zorro.svg',
            email: ''
        });
    }

    getCache() {
        const keys = ['currentUser', 'roles', 'routerRules', 'menus', 'currentGroupInfo'];
        const self = this;
        let flag = false;
        keys.forEach(item => {
            if (!self.session.get(item)) {
                flag = true;
            }
        });
        return flag;
    }

    private getGroupKey() {
        if (this.cookie.getItem(environment.prefix + 'currentStore')) {
            return this.cookie.getItem(environment.prefix + 'currentStore');
        }
        const groupInfo = this.session.get('currentGroupInfo');
        return groupInfo ? (groupInfo.groupType + '|' + groupInfo.groupId) : null;
    }

    private setDefaultEnvironment() {
        const selfHost = window.location.host;
        this.settingService.setLayout('collapsed', false);
        const link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        if (environment.ENV !== 'local') {
            environment.HOST = `https://${selfHost}`;
            /**
             * admin 项目全局信息初始化
             * 包含域名：
             *  admin[*].lechebang.cn
             *  admintest.lechebang.com
             *  admin.lechebang.com
             *  operation[*].lechebang.cn
             *  operationtest.lechebang.com
             *  operation.lechebang.com
             *  yundian[*].lechebang.cn
             *  yundiantest.edndc.com
             *  yundian.edndc.com
             */
            if (selfHost.includes('admin') && selfHost.includes('lechebang')) {
                environment.SERVER_URL = 'https://' + selfHost.replace('admin', 'm') + '/';
                environment.theme = 'A';
                environment.appCode = 202;
                environment.appName = '乐车邦';
                environment.manufacturer = 'lcb';
                this.titleService.default = '乐车邦';
                this.settingService.setLayout('lang', 'zh-CN');
                this.settingService.setLayout('headerNotify', true);
                // this.settingService.setLayout('isHeaderUdesk', true);
                this.settingService.setLayout('storeSwitch', true);
                this.settingService.setLayout('headerHelpCenter', true);
                this.translate.use('zh-CN');
                link.href = `/${environment.appId}/assets/img/favicon/lcb/favicon.ico`;
                document.getElementsByTagName('head')[0].appendChild(link);
            } else if (selfHost.includes('operation') && selfHost.includes('lechebang')) {
                environment.SERVER_URL = 'https://' + selfHost.replace('operation', 'm') + '/';
                environment.theme = 'default';
                environment.appCode = 302;
                environment.appName = '乐车邦';
                environment.manufacturer = 'lcb';
                this.titleService.default = '乐车邦';
                this.settingService.setLayout('lang', 'zh-CN');
                this.translate.use('zh-CN');
                link.href = `/${environment.appId}/assets/img/favicon/lcb/favicon.ico`;
                document.getElementsByTagName('head')[0].appendChild(link);
            } else if (selfHost.includes('supplier') && selfHost.includes('lechebang')) {
                environment.SERVER_URL = 'https://' + selfHost.replace('supplier', 'm') + '/';
                environment.theme = 'A';
                environment.appCode = 2403;
                environment.appName = '乐车邦';
                environment.manufacturer = 'lcb';
                this.titleService.default = '乐车邦';
                this.settingService.setLayout('lang', 'zh-CN');
                this.settingService.setLayout('storeSwitch', true);
                this.translate.use('zh-CN');
                link.href = `/${environment.appId}/assets/img/favicon/lcb/favicon.ico`;
                document.getElementsByTagName('head')[0].appendChild(link);
            } else if (selfHost.includes('yundian') && selfHost.includes('edndc')) {
                environment.SERVER_URL = 'https://' + selfHost.replace('yundian', 'm').replace('edndc', 'lechebang') + '/';
                environment.theme = 'A';
                environment.appCode = 203;
                environment.appName = '东风南方';
                environment.manufacturer = 'chebaba';
                this.titleService.default = '东风南方';
                this.settingService.setLayout('lang', 'en-US');
                this.settingService.setLayout('headerNotify', true);
                this.settingService.setLayout('storeSwitch', true);
                this.translate.use('en-US');
                link.href = `/${environment.appId}/assets/img/favicon/yundian/favicon.ico`;
                document.getElementsByTagName('head')[0].appendChild(link);
            } else if (selfHost.includes('yundian') && selfHost.includes('lechebang')) {
                environment.SERVER_URL = 'https://' + selfHost.replace('yundian', 'm') + '/';
                environment.theme = 'A';
                environment.appCode = 203;
                environment.appName = '东风南方';
                environment.manufacturer = 'chebaba';
                this.titleService.default = '东风南方';
                this.settingService.setLayout('lang', 'en-US');
                this.settingService.setLayout('headerNotify', true);
                this.settingService.setLayout('storeSwitch', true);
                this.translate.use('en-US');
                link.href = `/${environment.appId}/assets/img/favicon/yundian/favicon.ico`;
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        } else {
            // if (environment['layout'] && environment['layout']['isUdesk']) {
            //     this.settingService.setLayout('isUdesk', true);
            // }
            if (environment['layout'] && environment['layout']['headerNotify']) {
                this.settingService.setLayout('headerNotify', true);
            }
            if (environment['layout'] && environment['layout']['storeSwitch']) {
                this.settingService.setLayout('storeSwitch', true);
            }
            // if (environment['layout'] && environment['layout']['isHeaderUdesk']) {
            //     this.settingService.setLayout('isHeaderUdesk', true);
            // }
            if (environment['layout'] && environment['layout']['headerHelpCenter']) {
                this.settingService.setLayout('headerHelpCenter', true);
            }
            if (environment['manufacturer'] && environment['manufacturer'] === 'chebaba') {
                this.translate.use('en-US');
                environment.appCode = 203;
                this.titleService.default = '东风南方';
                link.href = '/assets/img/favicon/yundian/favicon.ico';
                document.getElementsByTagName('head')[0].appendChild(link);
            } else {
                this.titleService.default = '乐车邦';
                this.translate.use('zh-CN');
                link.href = '/assets/img/favicon/lcb/favicon.ico';
                document.getElementsByTagName('head')[0].appendChild(link);
            }

            environment.HOST = `http://${selfHost}`;
        }

    }
}
