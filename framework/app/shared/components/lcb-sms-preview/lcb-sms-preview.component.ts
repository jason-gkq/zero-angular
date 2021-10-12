import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';

@Component({
    selector: 'lcb-sms-preview',
    templateUrl: './lcb-sms-preview.component.html',
    styleUrls: ['./lcb-sms-preview.component.less']
})
export class LcbSmsPreviewComponent implements OnInit {
    @Input()
    set smsContent(value) {
        this.setSmsContentList(value);
    }
    smsContentList: Array<string> = [];
    smsContentCount: number = 1;         // 短信条数
    smsFixedCount = 8;  // 短信签名+退订固定字数【${groupName}】 退订回TD
    groupName: string;

    constructor(
        private _auth: AuthService
    ) {
        this.groupName = this._auth.currentGroupInfo.groupName;
    }

    ngOnInit() {
    }

    setSmsContentList(value) {
        this.smsContentList = [];
        if (!value) {
            this.smsContentCount = 1;
            return false;
        }
        if (value.length <= 70 - (this.groupName.length + this.smsFixedCount)) {
            this.smsContentCount = 1;
            this.smsContentList.push(`${value}`);
        } else {
            const prefix = 70 - (this.groupName.length + this.smsFixedCount);
            const counts = Math.ceil(value.slice(prefix).length / 67);
            this.smsContentCount = counts + 1;
            this.smsContentList.push(`${value.slice(0, 70 - (this.groupName.length + this.smsFixedCount))}`);
            for (let i = 0; i < counts; i++) {
                this.smsContentList.push(`${value.slice(prefix + i * 67, prefix + (i + 1) * 67)}`);
            }
        }
    }

}
