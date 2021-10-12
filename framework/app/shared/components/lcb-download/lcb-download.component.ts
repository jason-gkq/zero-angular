import { Component, OnDestroy, Input, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { environment } from '@env/environment';

@Component({
    selector: 'lcb-download',
    template: `
        <ng-container *ngTemplateOutlet="templateOutlet"></ng-container>
        <ng-template #defaultTmpl>
            <button nz-button [nzType]="'primary'" [nzLoading]="downloadLoding" (click)="itemDownload()">{{btnName||'下载'}}</button>
        </ng-template>
        <ng-template #notificationTmpl>
            <span style="margin-right: 16px;">下载任务已提交，请前往<a (click)="goToDownloadCenter()">下载中心</a>查看进度。</span>
        </ng-template>
    `,
    styles: []
})
/*
* @description 组件使用：<lcb-download [condition]="condition" [type]="type"></lcb-download>
* （condition: string; type: string;）由父组件传入
*  增加@input() btnName:按钮文字；displayTmpl:自定义下载样式,<ng-template> TemplateRef实例
*/
export class LcbDownloadComponent implements OnDestroy, AfterViewInit {
    downloadLoding: boolean = false;
    private download$$: Subscription;
    @Input() condition: string;
    @Input() type: string;
    @Input() btnName: string;
    @Input() displayTmpl: TemplateRef<{}>;
    @ViewChild('notificationTmpl') notificationTmpl: TemplateRef<{}>;
    @ViewChild('defaultTmpl') defaultTmpl;
    templateOutlet: TemplateRef<{}>;

    constructor(
        private http: HttpClient,
        private _msgSrv: NzMessageService,
        private notification: NzNotificationService,
    ) { }

    ngAfterViewInit() {
        if (!this.displayTmpl) {
            this.templateOutlet = this.defaultTmpl;
        } else {
            this.templateOutlet = this.displayTmpl;
        }
    }

    /**
     * 订单下载
     * @param type 下载类型
     * @param condition 下载查询条件集合
     */
    itemDownload(): void {
        this.downloadLoding = true;
        this.download$$ = this.http.post('gateway/common/file/api/download/createAdminFileDownload', {
            condition: this.condition ? this.condition.trim() : null,
            type: this.type ? this.type.trim() : null,
        }).subscribe(res => {
            this.notification.template(this.notificationTmpl, { nzAnimate: true });
            this.downloadLoding = false;
        },
            err => {
                // this._msgSrv.error('下载失败!');
                this.downloadLoding = false;
            },
            () => {
                this.downloadLoding = false;
            });
    }

    /**
     * 跳转下载中心
    */
    goToDownloadCenter() {
        // 区别supplier
        if (environment['downloadUrl']) {
            window.open(`${environment.HOST}${environment['downloadUrl']}`, '_blank');
        } else {
            window.open(`${environment.HOST}/common/workBench/download`, '_blank');
        }
    }

    ngOnDestroy() {
        if (this.download$$) this.download$$.unsubscribe();
    }

}
