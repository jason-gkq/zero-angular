import { CookieService } from '@core/cache/cookie.service';
import { LocalStorageService } from '@core/cache/local-storage.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../cache/session-storage.service';
import { UserModel } from './user.model';
import { UbtService } from '../ubt/ubt.service';
import { environment } from '@env/environment';

@Injectable()
export class UserService {

    static KEY_CURRENT_USER = 'currentUser';

    constructor(private session: SessionStorageService,
        private httpClient: HttpClient,
        private localSrv: LocalStorageService,
        private router: Router,
        private ubt: UbtService,
        private cookieSrv: CookieService) {
    }

    get currentUser(): UserModel {
        return this.session.get(UserService.KEY_CURRENT_USER) || null;
    }

    set currentUser(data: UserModel) {
        this.session.set(UserService.KEY_CURRENT_USER, data);
    }

    logout() {
        if (this.session.get('http:logout')) {
            console.log('logout is request...');
            return;
        }
        this.session.set('http:currentUser', 'http:logout', '1S');
        // 根据不同appCode做不同的请求
        this.httpClient
            .post('gateway/manage/common/api/user/logout', {})
            .subscribe(() => {
                this.ubt.saLogout();
                this.session.clearAll();
                this.localSrv.clearAll();
                try {
                    this.cookieSrv.removeItem('token', '/', this.cookieSrv.getDomain());
                } catch (error) {
                }
                this.router.navigateByUrl(`/user/login`);
            });

    }

}
