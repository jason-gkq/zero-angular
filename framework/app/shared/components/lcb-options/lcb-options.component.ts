import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { OptionModel } from '@shared/components/lcb-options/lcb-options.model';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { AuthService } from '@core/auth/auth.service';

@Component({
    selector: 'lcb-options',
    templateUrl: './lcb-options.component.html',
    styleUrls: ['./lcb-options.component.less']
})

export class LcbOptionsComponent implements OnInit {
    _options: OptionModel;
    @Input()
    set options(options) {
        this._options = options;
    }

    _itemId;
    @Input()
    set itemId(itemId) {
        this._itemId = itemId;
    }

    @Output()
    acEvtOption = new EventEmitter();

    options1 = [];
    options2 = [];
    optList = [];

    constructor(
        private router: LcbRouterService,
        private ngRouter: Router,
        private authService: AuthService) {
    }

    ngOnInit() {
        this.disposeOptions();
    }

    disposeOptions() {
        const showCount = this._options.showCount ? this._options.showCount : 1;
        const that = this;
        if (showCount) {
            // 过滤数据状态控制（hidden）
            let optList = this._options.optList.filter(item => !item.hidden);
            // 过滤权限
            optList = this.filterByAuth(optList);
            this.optList = optList;
            optList.forEach(function (item, index) {
                if (index < showCount || optList.length === showCount + 1) {
                    that.options1.push(item);
                } else {
                    that.options2.push(item);
                }
            });
        }
    }

    // 权限过滤
    filterByAuth(optList) {
        const newOptList = [];
        optList.forEach(item => {
            if (item.auth) {
                if (this.authService.check(item.auth)) {
                    newOptList.push(item);
                }
            } else {
                newOptList.push(item);
            }
        });
        return newOptList;
    }

    // 操作组触发事件
    activeEvt(evt) {
        this.acEvtOption.emit({ event: evt, id: this._itemId });
    }

    // 跳转路由
    goTo(opt) {
        setTimeout(() => {
            if (opt.target === '_blank') {
                window.open(this.ngRouter.createUrlTree([opt.url[0]], { queryParams: opt.url[1] }).toString());
            } else {
                this.router.goTo(opt.url[0], opt.url[1]);
            }
        }, 100);
    }
}
