import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from '@core/cache/cookie.service';
import { RoleModel } from '@core/user/role.model';
import { UtilsService } from '@core/utils/utils.service';
import { ReuseTabService } from '@delon/abc';
import { environment } from '@env/environment';
import * as _ from 'lodash';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { SessionStorageService } from '../cache/session-storage.service';
import { LcbMenuService } from '../menu/lcb-menu.service';
import { BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';

@Injectable()
export class AuthService {

    private _change$: BehaviorSubject<RoleModel[]> = new BehaviorSubject<RoleModel[]>([]);

    static KEY_ROLES = 'roles';
    static KEY_ROUTER_RULES = 'routerRules';
    static KEY_GROUP_INFO = 'currentGroupInfo';
    static KEY_EXPIRES = 600;


    constructor(private session: SessionStorageService,
        private cookie: CookieService,
        private reuseTabService: ReuseTabService,
        private httpClient: HttpClient,
        private menu: LcbMenuService,
        private utils: UtilsService) {
        if (this.roles) { // && !this.currentGroupInfo
            const flag = this.setGroupInfo(this.roles);
            if (!flag) {
                menu.setMenu();
                this.setRouterRules();
            }
        }
    }

    get change(): Observable<RoleModel[]> {
        return this._change$.pipe(share());
    }

    get currentGroupInfo() {
        return this.session.get(AuthService.KEY_GROUP_INFO);
    }

    set currentGroupInfo(data) {
        this.session.set(AuthService.KEY_GROUP_INFO, data);
    }

    get routerRules(): string[] {
        return this.session.get(AuthService.KEY_ROUTER_RULES) || [];
    }

    set routerRules(data) {
        this.session.set(AuthService.KEY_ROUTER_RULES, data);
    }

    get roles() {
        return this.session.get(AuthService.KEY_ROLES);
    }

    set roles(data) {
        this.session.set(AuthService.KEY_ROLES, data);
    }

    /**
     *
     * @param {string} url
     * @returns {boolean}
     */
    public check(url: string): boolean {
        if (typeof url === 'string') {
            return this.routerRules.indexOf(url.trim()) !== -1;
        }
        return false;

        // const appList = Object.keys(this.routerRules);
        // const moduleList = Object.keys(this.routerRules[appName]);
        // // 检查 app 级（一级路由）的权限
        // if (appList.find(app => this.routerRules[app] === '*')) {
        //     return true;
        // }
        // // 检查 模块 级（二级路由）的权限
        // if (moduleList.find(module => this.routerRules[appName][module] === '*') || moduleList.find(module => this.routerRules[appName][module] === url)) {
        //     return true;
        // }

        // return this.routerRules[appName][moduleName].indexOf('*') !== -1 || (<Array<string>>(this.routerRules[appName][moduleName])).indexOf(url) !== -1;
    }

    /**
     * 切换店铺，更新缓存信息（更新当前店铺缓存、更新菜单信息、更新前端路由权限信息）
     * @param store
     */
    changeStore(store) {
        new Promise((resolve, reject) => {
            const flag = this.setGroupInfo(this.session.get(AuthService.KEY_ROLES), store);
            if (flag) {
                resolve(store);
            } else {
                this.menu.setMenu();
                this.httpClient.post('gateway/manage/common/api/routes/userRoutesByGroup', {}).subscribe(
                    (res: string[]) => {
                        this.routerRules = res || [];
                        resolve(this.routerRules);
                    }, () => {

                    }
                );
            }
        }).then(() => {
            this.reuseTabService.clear();
            this._change$.next(store);
        });
    }

    getCurrentRole() {
        return this.currentGroupInfo ? this.currentGroupInfo.roles : [];
    }

    getCurrentGroupType() {
        return this.currentGroupInfo ? this.currentGroupInfo.groupType : null;
    }

    getCurrentGroupId() {
        return this.currentGroupInfo ? this.currentGroupInfo.groupId : null;
    }

    getGroupList(): Array<RoleModel> {
        const ret = [];
        if (this.roles) {
            const roles = this.roles || [];
            for (const i in roles) {
                ret.push(roles[i]);
            }
        }
        return ret;
    }

    getStoreList(): Observable<Array<any>> {
        const groupType = this.getCurrentGroupType();
        const groupId = this.getCurrentGroupId();
        const key = `storeListByGroupType${groupType}${groupId}`;
        const self = this;
        if (!self.session.get(key)) {
            const storeList = [];
            return this.httpClient.post<Array<any>>('gateway/saas/ext/auth/user/getStoreList', {}).map(data => {
                data.forEach(item => {
                    storeList.push({
                        name: item.storeNickName,
                        value: item.id
                    });
                });
                self.session.set(key, storeList);
                return storeList;
            });
        }
        return Observable.create(observer => {
            observer.next(self.session.get(key));
            observer.complete();
        });
    }

    private setRouterRules() {
        this.httpClient.post('gateway/manage/common/api/routes/userRoutesByGroup', {}).subscribe(
            (res: string[]) => {
                this.routerRules = res || [];
            }
        );
    }

    private setGroupInfo(data, store?): boolean {
        const groupInfo = this.session.get(AuthService.KEY_GROUP_INFO);
        const oldKey = groupInfo ? (groupInfo.groupType + '|' + groupInfo.groupId) : null;
        let key = _.head(Object.keys(data));
        if (store) {
            key = store.groupType + '|' + store.groupId;
        } else if (this.cookie.getItem(environment.prefix + 'currentStore')) {
            key = this.cookie.getItem(environment.prefix + 'currentStore');
        }

        if (data[key]) {
            this.currentGroupInfo = data[key];
            this.utils.setCookieDomains(environment.prefix + 'currentStore', key);
            // this.cookie.setItem(environment.prefix + 'currentStore', key, 86400 * 30, '/', UtilsService.getRootDomain());
        } else {
            const tmpValues = [];
            const tmpKeys = [];
            if (data) {
                for (const i in data) {
                    tmpValues.push(data[i]);
                    tmpKeys.push(i);
                }
            }
            this.currentGroupInfo = _.head(tmpValues);
            this.utils.setCookieDomains(environment.prefix + 'currentStore', key);
            // this.cookie.setItem(environment.prefix + 'currentStore', _.head(tmpKeys), 86400 * 30, '/', UtilsService.getRootDomain());
        }
        console.log('old-group ==> new group: ', oldKey, key);
        return oldKey === key;
    }

}
