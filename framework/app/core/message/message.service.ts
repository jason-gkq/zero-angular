import { environment } from '@env/main';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
const GATEWAY_BIZ = 'gateway/manage/store/biz';
const GATEWAY_SUPPLIER = 'gateway/manage/supplier';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class MessageService implements OnDestroy {

    private msgCount$: BehaviorSubject<number>;
    private audioUrl$: BehaviorSubject<string>;

    constructor(private _http: HttpClient) {
        this.msgCount$ = new BehaviorSubject<number>(0);
        this.audioUrl$ = new BehaviorSubject<string>(null);
    }

    init() {
        this.resetMsgCount();
        const period = environment.notificationPeriod || 1800000;
        return interval(period).do(() => {
            this.resetMsgCount();
        });
    }

    resetMsgCount() {
        this.queryTerminalUnreadMessageCountByUserId().subscribe((res: any) => {
            const count = Number(res);
            if (environment.appCode === 202 || environment.appCode === 203) {
                this.msgCount$.next(count);
            } else {
                this.msgCount$.next(res.messageCount);
                this.audioUrl$.next(res.lastAudioUrl);
            }
        });
    }

    getUnreadMsgCount(): Observable<any> {
        return this._http.post('gateway/saas/carSales/message/countUnReadMessage', {});
    }

    getMsgCount(): Observable<number> {
        return this.msgCount$;
    }

    getAudioUrl(): Observable<string> {
        return this.audioUrl$;
    }

    getUnreadMsgIndex(types?: string[]): Observable<any> {
        return this._http.post('gateway/saas/carSales/message/queryMsgList', {
            isNeedTypeNum: true,
            currentPage: 1,
            pageSize: types ? 10 : 40,
            readStatus: 0,
            types: types || [1, 2, 3, 4]
        });
    }

    getUnreadMsg(params: {
        isNeedTypeNum: boolean,
        currentPage: number,
        pageSize: number,
        readStatus: number,
        types: number[]
    }): Observable<any> {
        return this._http.post('gateway/saas/carSales/message/queryMsgList', {
            isNeedTypeNum: params.isNeedTypeNum,
            currentPage: params.currentPage,
            pageSize: params.pageSize,
            readStatus: params.readStatus,
            types: params.types
        });
    }

    markMsgsAsRead(ids: string[]): Observable<any> {
        return this._http.post('gateway/saas/carSales/message/updateMessagesRead', {
            messageIds: ids
        });
    }

    deleteMessages(ids: string[]): Observable<any> {
        return this._http.post('gateway/saas/carSales/message/deleteMessages', {
            messageIds: ids
        });
    }

    ngOnDestroy() {

    }

    /**
     * 查询消息列表
     * @param params
     */
    queryMessageList(params): Observable<any> {
        return this._http.post(`${(environment.appCode === 202 || environment.appCode === 203) ? GATEWAY_BIZ : GATEWAY_SUPPLIER}/remind/message/queryMessageList`, {
            businessTypes: params.businessTypes,
            msgStatusList: params.msgStatusList,
            page: params.page,
            dateTime: params.dateTime,
            terminalCode: (environment.appCode === 202 || environment.appCode === 203) ? 2 : 4
        });
    }

    /**
     * 根据终端查询用户所有业务类型下的未读消息数量
     */
    queryTerminalUnreadMessageCountByUserId(): Observable<any> {
        return this._http.post(`${(environment.appCode === 202 || environment.appCode === 203) ? GATEWAY_BIZ : GATEWAY_SUPPLIER}/remind/message/queryTerminalUnreadMessageCountByUserId`, {
            terminalCode: (environment.appCode === 202 || environment.appCode === 203) ? 2 : 4
        });
    }

    /**
     * 根据终端查询用户所有业务类型下的未读消息
     */
    queryTerminalUnreadMessageByUser(): Observable<any> {
        return this._http.post(`${(environment.appCode === 202 || environment.appCode === 203) ? GATEWAY_BIZ : GATEWAY_SUPPLIER}/remind/message/queryTerminalUnreadMessageByUser`, {
            terminalCode: (environment.appCode === 202 || environment.appCode === 203) ? 2 : 4
        });
    }

    /*******************************supplier后台消息接口*******************************/
    /**
     * 阅读单条消息
     * @param messageId
     */
    readSingleMessage(messageId): Observable<any> {
        return this._http.post(`${GATEWAY_SUPPLIER}/remind/message/readSingleMessage`, {
            messageId: messageId
        });
    }

}
