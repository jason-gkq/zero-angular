import { MessageService } from '@core/message/message.service';
import { MonitorService } from '@core/utils/monitor.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { DictionaryService } from '@core/common/dictionary.service';
import { RoleModel } from '@core/user/role.model';
import { environment } from '@env/environment';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { SettingsService } from '@delon/theme';


@Component({
    selector: 'store-switch',
    template: `
    <ng-container *ngIf="storeList.length==0;else elseBlock">
        {{formatStoreName(currentStore)|async}}
    </ng-container>
    <ng-template #elseBlock>
        <ng-container *ngIf="env.appCode!=2403; else elseTemplate">
            <div nz-dropdown nzPlacement="bottomRight" [nzDropdownMenu]="storeTpl">
                {{formatStoreName(currentStore)|async}}<i nz-icon nzType="down"></i>
            </div>
            <nz-dropdown-menu #storeTpl="nzDropdownMenu">
                <ul *ngIf="storeList" nz-menu nzSelectable>
                    <li nz-menu-item  *ngFor="let store of storeList" (click)="showModal(store)">{{formatStoreName(store)|async}}</li>
                </ul>
            </nz-dropdown-menu>
        </ng-container>
        <ng-template #elseTemplate>
            <nz-select nzShowSearch style="width: 300px;" [(ngModel)]="currentStore.groupType+'|'+currentStore.groupId" (ngModelChange)="selectStore($event)">
                <nz-option *ngFor="let store of storeList" (click)="showModal(store)"  [nzValue]="store.groupType+'|'+store.groupId" [nzLabel]="formatStoreName(store)|async"></nz-option>
            </nz-select>
        </ng-template>

        <nz-modal [(nzVisible)]="isVisible" nzTitle="店铺切换" nzCancelText="取消" nzOkText="去首页" (nzOnCancel)="handleCancel()" (nzOnOk)="handleOk()">
            <p>当前{{formatStoreName(currentStore)|async}}</p>
            <p>切换至{{formatStoreName(nextStore)|async}}</p>
        </nz-modal>
    </ng-template>
    `,
    styles: [`
        a {
            display: inline-block;
            height: 46px;
            line-height: 46px;
        }

        ul {
            max-height: 400px;
            overflow: auto;
        }
    `]
})

export class HeaderStoreSwitchComponent implements OnInit, OnDestroy {
    storeList: Array<RoleModel> = [];
    currentStore: RoleModel;
    env = environment;

    private change$: Subscription;
    // modal 状态
    isVisible = false;
    nextStore: RoleModel;

    constructor(
        private auth: AuthService,
        private dictionarySrv: DictionaryService,
        private router: Router,
        private monitorSrv: MonitorService,
        private _msgSrv: MessageService,
        public settings: SettingsService
    ) { }

    ngOnInit() {
        if (this.settings.layout.storeSwitch) {
            this.setStores();
        }
        this.change$ = this.auth.change.subscribe(data => {
            this.setStores();
        });
    }

    // 过滤当前店铺
    private setStores() {
        this.currentStore = this.auth.currentGroupInfo;
        this.storeList = this.auth.getGroupList();
        const self = this;
        if (this.env.appCode !== 2403) {
            this.storeList = this.storeList.filter(function (item) {
                return item['groupId'] !== self.currentStore.groupId || item['groupType'] !== self.currentStore.groupType;
            });
        }

    }

    selectStore($event) {
        const store = this.storeList.find(item => item.groupId + '' === $event.split('|')[1] && item.groupType + '' === $event.split('|')[0]);
        if (store) this.showModal(store);
    }

    showModal(store): void {
        this.nextStore = store;
        this.isVisible = true;
    }

    handleOk(): void {
        new Promise((resolve, reject) => {
            this.storeSwitch(this.nextStore);
            // 刷新消息
            this._msgSrv.resetMsgCount();
            resolve('');
        }).then(() => {
            this.isVisible = false;
            this.router.navigateByUrl(environment.defaultHome);
        });
    }

    handleCancel(): void {
        this.currentStore = this.auth.currentGroupInfo;
        this.isVisible = false;
    }

    // 切换店铺
    /**
     * {"groupType": 2, "groupId": 12}
     * @param store
     */
    private storeSwitch(store) {
        // 重新加载权限
        this.auth.changeStore({ groupType: store.groupType, groupId: store.groupId, groupName: store.groupName });
        this.setStores();
        this.monitorSrv.storeSwitchSubject.next(store);
    }

    formatStoreName(store: any): Observable<string> {
        return Observable.create(observer => {
            if (store) {
                this.dictionarySrv.getStoreFullName(store.groupType).subscribe(groupType => {
                    observer.next(`${groupType}：${store.groupName}`);
                    observer.complete();
                });
            } else {
                observer.next('');
                observer.complete();
            }
        });
    }

    ngOnDestroy(): void {
        this.change$.unsubscribe();
    }
}
