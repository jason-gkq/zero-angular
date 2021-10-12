import { Observable } from 'rxjs/index';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { SessionStorageService } from '@core/cache/session-storage.service';
import { environment } from '@env/environment';
// import { CookieService } from '@core/cache/cookie.service';
import { UtilsService } from '@core/utils/utils.service';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MenuService } from '@delon/theme';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {
    constructor(
        private authService: AuthService,
        private menuService: MenuService,
        private user: UserService,
        private router: Router,
        private session: SessionStorageService,
        // private cookie: CookieService,
        private http: HttpClient,
        private utils: UtilsService
    ) {
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

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
        // admin增加groupType,groupId判断（自动切换店铺）
        if (environment.appCode === 202 || environment.appCode === 203) {
            // 判断目标店铺是否是当前店铺
            const groupType = route.queryParams.groupType;
            const groupId = route.queryParams.groupId;
            if (groupId && groupType && (Number(groupId) !== this.authService.getCurrentGroupId() || Number(groupType) !== this.authService.getCurrentGroupType())) {
                const key = `${groupType}|${groupId}`;
                // 有该店铺权限
                if (this.roles[key]) {
                    this.session.set(AuthService.KEY_GROUP_INFO, this.roles[key]);
                    // this.cookie.setItem(environment.prefix + 'currentStore', key, 86400 * 30, '/', UtilsService.getRootDomain());
                    this.utils.setCookieDomains(environment.prefix + 'currentStore', key);
                    // 请求菜单与权限
                    const all$ = forkJoin(
                        this.http.post('gateway/manage/common/api/menu/queryUserMenus', {}),
                        this.http.post('gateway/manage/common/api/routes/userRoutesByGroup', {})
                    );
                    return new Observable<boolean>((observer) => {
                        all$.subscribe(res => {
                            // 存储菜单
                            this.session.set('menus', res[0]);
                            this.menuService.clear();
                            this.menuService.add(<any>res[0]);
                            // 存储权限
                            this.routerRules = <string[]>res[1] || [];
                            // 校验域名
                            const domainResult = this.checkDomain(state.url);
                            if (!domainResult) {
                                return observer.next(false);
                            }
                            // 权限判断
                            const result = this.authCheck(route, state);
                            observer.next(result);
                            observer.complete();
                        }, err => {
                            observer.error(err);
                            observer.complete();
                        });
                    });

                } else {
                    alert('权限不足');
                    this.router.navigateByUrl(`/403`);
                    return false;
                }
            } else {
                // 校验域名
                const domainResult = this.checkDomain(state.url);
                if (!domainResult) {
                    return false;
                }
                return this.authCheck(route, state);
            }
        } else {
            return this.authCheck(route, state);
        }
    }

    // 检测域名，如果当前域名与缓存域名不符，则改为缓存域名
    checkDomain(url) {
        if (environment.ENV !== 'local') {
            const domain = this.roles[`${this.authService.getCurrentGroupType()}|${this.authService.getCurrentGroupId()}`]['domain'];
            const whiteList = ['/saas/full/applet/authorize'];
            if (domain && domain !== location.origin && !whiteList.find(item => url.includes(item))) {
                let target: string;
                if (environment.ENV === 'test') {
                    const host0 = location.host.split('.')[0];
                    let testEnv = '';
                    if (host0 !== 'admin' && host0 !== 'yundian') {
                        testEnv = host0.substring(host0.length - 1);
                    }
                    const arr1 = domain.split('//');
                    const arr2 = arr1[1].split('.');
                    let domain0 = arr2[0];
                    if (domain0 !== 'admin' && domain0 !== 'yundian') {
                        domain0 = domain0.substring(0, domain0.length - 1);
                    }
                    domain0 += testEnv;
                    arr2[0] = domain0;
                    target = `${arr1[0] + '//' + arr2.join('.')}${url}`;
                    // 设置新的domain
                    const newDomain = `${arr1[0] + '//' + arr2.join('.')}`;
                    const newRoles = Object.assign({}, this.roles);
                    newRoles[`${this.authService.getCurrentGroupType()}|${this.authService.getCurrentGroupId()}`]['domain'] = newDomain;
                    this.roles = newRoles;
                } else {
                    target = `${domain}${url}`;
                }
                if (target.includes('groupType=') && target.includes('groupId=')) {
                    location.href = target;
                } else {
                    if (target.includes('?')) {
                        location.href = target + `&groupType=${this.authService.getCurrentGroupType()}&groupId=${this.authService.getCurrentGroupId()}`;
                    } else {
                        location.href = target + `?groupType=${this.authService.getCurrentGroupType()}&groupId=${this.authService.getCurrentGroupId()}`;
                    }
                }
                return false;
            }
        }
        return true;
    }

    authCheck(route, state) {
        const url: string = state.url;
        const permission = route.data.auth;
        // 权限验证
        let result = false;
        if (this.user.currentUser) {
            if (!!permission) {
                result = this.authService.check(permission);
            } else {
                result = true;
            }
        }
        if (!result) {
            if (this.roles && this.routerRules) {
                alert('权限不足');
                this.router.navigateByUrl(`/403`);
            } else {
                this.router.navigateByUrl(`/user/login`);
            }
        }
        return result;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
        return this.canActivate(route, state);
    }

    /* . . . */
}
