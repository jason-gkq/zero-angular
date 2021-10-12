import { Component, EventEmitter, Input, Output } from '@angular/core';
import { toBoolean, toNumber } from '@delon/util';

@Component({
    selector: 'notice-icon',
    template: `
    <div class="item" style="min-width: 0px;"
        nz-popover
        [nzPopoverVisible]="popoverVisible"
        (nzPopoverVisibleChange)="onVisibleChange($event)"
        nzPopoverTrigger="click"
        nzPopoverPlacement="bottomRight"
        [nzPopoverContent]="nzTemplate"
        nzPopoverOverlayClassName="ad-notice-icon-con">
        <nz-badge [nzDot]="count>0">
            <i nz-icon nzType="bell" nzTheme="outline" style="color: rgba(0, 0, 0, 0.65) !important; font-size:14px;"></i>
            <ng-template #nzTemplate>
                <nz-spin [nzSpinning]="loading" [nzDelay]="0">
                <nz-tabset (nzSelectedIndexChange)="onTabIndexChange($event)">
                    <nz-tab *ngFor="let i of data;let idx = index;" [nzTitle]="i.businessTypeName + '('+i.messageCount +')'" (nzClick)="onTabClick(i)">
                        <notice-icon-tab
                            [data]="i"
                            (select)="onSelect($event)"
                            (clear)="onClear($event)"></notice-icon-tab>
                    </nz-tab>
                </nz-tabset>
                </nz-spin>
            </ng-template>
        </nz-badge>
    </div>
  `,
    host: { '[class.ad-notice-icon]': 'true' },
    preserveWhitespaces: false,
})
export class NoticeIconComponent {
    @Input() data: any[] = [];

    /** 图标上的消息总数 */
    @Input()
    get count() {
        return this._count;
    }
    set count(value: any) {
        this._count = toNumber(value);
    }
    private _count: number;

    /** 弹出卡片加载状态 */
    @Input()
    get loading() {
        return this._loading;
    }
    set loading(value: any) {
        this._loading = toBoolean(value);
    }
    private _loading = false;

    @Output() select = new EventEmitter<any>();
    @Output() clear = new EventEmitter<string>();
    @Output() tabIndexChange = new EventEmitter<number>();

    @Output() tabClick = new EventEmitter<number>();
    /** 手动控制Popover显示 */
    @Input()
    get popoverVisible() {
        return this._popoverVisible;
    }
    set popoverVisible(value: any) {
        this._popoverVisible = toBoolean(value);
    }
    private _popoverVisible = false;

    @Output() popoverVisibleChange = new EventEmitter<boolean>();

    onVisibleChange(result: boolean) {
        this.popoverVisibleChange.emit(result);
    }

    onSelect(i: any) {
        this.select.emit(i);
    }

    onClear(title: string) {
        this.clear.emit(title);
    }

    onTabIndexChange(index: number) {
        this.tabIndexChange.emit(index);
    }

    onTabClick(index: number) {
        this.tabClick.emit(index);
    }
}
