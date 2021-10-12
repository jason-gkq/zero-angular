import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

    constructor(
        private _authSrv: AuthService,
        private _lcbRouterSrv: LcbRouterService,
        private _http: HttpClient,
    ) {
        if (environment.ENV !== 'local') {
            if (_authSrv.getGroupList().length === 1 && _authSrv.check('/supply/purchase/center')) {
                _lcbRouterSrv.goTo('/supply/purchase/center');
            } else {
                // 根据appCode跳转admin、operation
                const appCode = environment.appCode;
                // 区分admin、operation与supplier三系统跳转
                (appCode === 202 || appCode === 203) ? this.linkToPanel() : appCode === 302 ? _lcbRouterSrv.goTo('/common/workBench/storeSwitch') : _lcbRouterSrv.goTo(environment.defaultHome);
            }
        }
    }


    ngOnInit(): void {

    }

    // 判断店铺小程序是否开通
    linkToPanel() {
        this._http.post('gateway/manage/store/wechat/saasStoreManage/getStoreStatusInfo', null).subscribe(res => {
            if (res && res['status'] === 2) {
                environment.appId.indexOf('common') > -1 ? this._lcbRouterSrv.goTo('/common/panel') : window.open(`${environment.HOST}/common/panel`, '_self');
            } else {
                this._lcbRouterSrv.goTo('/common/workBench/storeSwitch');
            }
        }, err => {
            this._lcbRouterSrv.goTo('/common/workBench/storeSwitch');
        });
    }

}
