import { UserModel } from '@core/user/user.model';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { UserService } from '@core/user/user.service';
import { SettingsService } from '@delon/theme';
import { environment } from '@env/environment';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LocalStorageService } from '@core/cache/local-storage.service';
import { SessionStorageService } from '@core/cache/session-storage.service';
import { CookieService } from '@core/cache/cookie.service';
@Component({
    selector: 'header-user',
    template: `
        <div class="d-flex align-items-center px-sm" nz-dropdown nzPlacement="bottomRight" [nzDropdownMenu]="userTpl">
            {{currentUser?.userInfo?.realName || currentUser?.user?.mobile}}
            <nz-avatar [nzSrc]="settings.user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
        </div>
        <nz-dropdown-menu #userTpl="nzDropdownMenu">
            <div nz-menu class="width-sm">
                <div style="max-height:650px;overflow-y:auto">
                    <div *ngFor="let role of auth.getCurrentRole()">
                        <p class="m0 text-muted" style="padding: 5px 12px">
                            <small>{{role.roleName}}</small>
                        </p>
                    </div>
                    <li nz-menu-divider></li>
                    <div nz-menu-item (click)="routerService.goTo('/common/workBench/profile')"><i nz-icon nzType="user" nzTheme="outline"></i>个人信息</div>
                    <div nz-menu-item (click)="routerService.goTo('/common/workBench/storeSwitch')" *ngIf="settings.layout.storeSwitch"><i nz-icon nzType="select" nzTheme="outline"></i>切换店铺</div>
                    <div nz-menu-item (click)="cleanStorage()"><i nz-icon nzType="warning" nzTheme="outline"></i>清除缓存</div>
                    <div nz-menu-item (click)="user.logout()"><i nz-icon nzType="logout" nzTheme="outline"></i>退出登录</div>
                </div>
            </div>
        </nz-dropdown-menu>

        <ng-template #notificationTpl let-notification>
            <div class="ant-notification-notice-content">
                <div>
                    <div class="ant-notification-notice-message">欢迎使用新版商家后台系统</div>
                    <div class="ant-notification-notice-description">
                        1. 商家后台全新升级，为您带来耳目一新的视觉体验；
                        <br> 2. 新增在线客服，有问题可随时在右上角联系客服；
                        <br> 3. 商城中心全面改版，采购下单一气呵成；
                        <br> 4. 操作与老版系统几乎相同，新老系统无缝切换；
                        <br>
                        <br> 您可以马上开始工作，或者点击下方按钮查看
                        <strong>新版系统操作手册</strong>
                    </div>
                    <span class="ant-notification-notice-btn">
                        <button nz-button nzType="primary" nzSize="small" (click)="notification.close();handleNotificationClick()">
                            <span>查看帮助</span>
                        </button>
                    </span>
                </div>
            </div>
        </ng-template>


    `,
    styles: [`
        nz-avatar {
            margin-left: 12px;
        }
        .px-sm {
            margin-right: 16px !important;
            padding-right: 0px !important;
            padding-left: 0px !important;
        }
        a{
            height: 48px;
        }

        ::ng-deep .ant-notification{
            width: auto !important;
        }
    `]
})
export class HeaderUserComponent implements OnInit {
    env = environment;
    currentUser: UserModel;

    @ViewChild('notificationTpl')
    notificationTpl: TemplateRef<any>;

    constructor(public settings: SettingsService,
        public routerService: LcbRouterService,
        private modalService: NzModalService,
        private localSrv: LocalStorageService,
        private sessionSrv: SessionStorageService,
        private cookieSrv: CookieService,
        private _notificationSrv: NzNotificationService,
        public user: UserService,
        public auth: AuthService) {
    }

    ngOnInit(): void {
        this.currentUser = this.user.currentUser;

        const logined = !!this.localSrv.get('logined');
        if (!logined && (new Date().getTime() < new Date('2018-07-30').getTime())) {
            setTimeout(() => {
                this._notificationSrv.template(this.notificationTpl, { nzDuration: 0 });
            }, 600);
        }
    }

    handleNotificationClick() {
        this.localSrv.set('logined', true);
        this.routerService.goTo('/common/help/system');
    }

    cleanStorage() {
        this.modalService.confirm({
            nzTitle: '是否确定清除系统缓存',
            nzContent: '<b style="color: red;">该操作将会清除系统缓存信息</b>',
            nzOkText: '确定',
            nzOkType: 'danger',
            nzOnOk: () => {
                this.localSrv.clearAll();
                this.sessionSrv.clearAll();
                this.cookieSrv.clearAll();

                setTimeout(() => {
                    window.location.reload();
                }, 200);
            },
            nzCancelText: '取消',
            nzOnCancel: () => console.log('取消清除缓存')
        });
    }

}
