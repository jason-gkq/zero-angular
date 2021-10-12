import { Component, OnDestroy, OnInit } from '@angular/core';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { MessageService } from '@core/message/message.service';
import { NoticeIconList, NoticeItem } from '@delon/abc';
import { environment } from '@env/environment';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { Subscription } from 'rxjs';
import { SettingsService } from '@delon/theme';

/**
 * 菜单通知
 */
@Component({
    selector: 'header-notify',
    template: `
    消息<notice-icon
        [data]="data"
        [count]="count"
        [loading]="loading"
        (select)="select($event)"
        (clear)="clear($event)"
        (tabClick)="getNotificationsByType($event)"
        (popoverVisibleChange)="loadData($event)"></notice-icon>
        <audio id="myAudio" *ngIf="audioUrl" [src]="audioUrl"></audio>
    `
})
export class HeaderNotifyComponent implements OnInit, OnDestroy {

    data: NoticeItem[] = [];
    count = 0;
    loading = false;

    timer$$: Subscription;
    count$$: Subscription;
    initFlag = true;
    audioUrl;
    audioUrl$$: Subscription;

    constructor(
        private _msgSrv: MessageService,
        private _lcbRouterSrv: LcbRouterService,
        public settings: SettingsService
    ) {

    }

    ngOnInit() {
        if (this.settings.layout.headerNotify) {
            this.timer$$ = this._msgSrv.init().subscribe();
            this.count$$ = this._msgSrv.getMsgCount().subscribe(count => {
                this.count = count;
            });
            this.audioUrl$$ = this._msgSrv.getAudioUrl().subscribe(audioUrl => {
                this.audioUrl = audioUrl;
                if (this.audioUrl) {
                    setTimeout(() => {
                        document.getElementById('myAudio')['play']();
                    });
                }
            });
        }
    }

    ngOnDestroy() {
        this.timer$$.unsubscribe();
        this.count$$.unsubscribe();
        this.audioUrl$$.unsubscribe();
    }

    updateNoticeData(notices: NoticeIconList[]): NoticeItem[] {
        const data = this.data.slice();
        data.forEach(i => i.list = []);

        notices.forEach(item => {
            const newItem = { ...item };
            if (newItem.datetime)
                newItem.datetime = formatDistanceToNow(new Date(item.datetime), { locale: (window as any).__locale__ });
            if (newItem.extra && newItem.status) {
                newItem.color = ({
                    todo: undefined,
                    processing: 'blue',
                    urgent: 'red',
                    doing: 'gold',
                })[newItem.status];
            }
            data.find(w => w.title === newItem.type).list.push(newItem);
        });
        return data;
    }

    reduceMsg(msgTypes: any[] = [], msgList: any[] = []) {

        const msgListObj = {};
        msgList.forEach(msg => {
            const type = String(msg.type);
            if (msgListObj[type] && Array.isArray(msgListObj[type])) {
                msgListObj[type].push(msg);
            } else {
                msgListObj[type] = [msg];
            }
        });

        this.data = msgTypes.map(item => {
            return {
                title: item.typeName,
                list: msgListObj[item.type] || [],
                unreadCount: item.unReadNum,
                type: item.type
            } as NoticeItem;
        });
    }

    getNotificationsByType(item) {
        this.loading = true;
        if (!this.initFlag) {
            this.getData(item);
        }
    }

    loadData(isOpen) {
        if (this.loading || !isOpen) return;
        this.getData();

    }

    getData(msgItem?) {
        this._msgSrv.queryTerminalUnreadMessageByUser().subscribe(res => {
            const data = res;
            let businessType = msgItem && msgItem.businessType;
            if (!businessType) {
                businessType = data[0]['businessType'];
            }
            this._msgSrv.queryMessageList({
                businessTypes: [businessType],
                msgStatusList: [0],
                page: {
                    currentPage: 1,
                    pageSize: 50
                },
                dateTime: msgItem && (environment.appCode === 202 || environment.appCode === 203) ? msgItem.lastDateTime : null
            }).subscribe(msgs => {
                this.initFlag = false;
                this.loading = false;
                const nowType = data.find(item => item['businessType'] === businessType);
                nowType['list'] = msgs ? msgs.list : [];
                this.data = data;
                this._msgSrv.resetMsgCount();
            });
        });
    }

    clear(type: string) {
        if (environment.appCode === 202 || environment.appCode === 203) {
            this._lcbRouterSrv.goTo('/common/workBench/message');
        } else if (environment.appCode === 2403) {
            this._lcbRouterSrv.goTo('/saas/workBench/message');
        }
    }

    select(res: any) {
        // this.msg.success(`点击了 ${res.title} 的 ${res.item.title}`);
        if (environment.appCode === 202 || environment.appCode === 203) {
            this._lcbRouterSrv.goTo('/common/workBench/message');
        } else if (environment.appCode === 2403) {
            this._lcbRouterSrv.goTo('/saas/workBench/message');
        }
    }
}
