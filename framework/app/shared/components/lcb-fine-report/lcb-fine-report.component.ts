import { HttpClient } from '@angular/common/http';
import {
    Component,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    Output,
    EventEmitter,
    AfterViewInit
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '@core/auth/auth.service';
import { CookieService } from '@core/cache/cookie.service';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs';

@Component({
    selector: 'lcb-fine-report',
    templateUrl: './lcb-fine-report.component.html',
    styleUrls: ['./lcb-fine-report.component.less']
})
export class LcbFineReportComponent implements OnInit, OnDestroy, AfterViewInit {
    src: SafeResourceUrl;
    flag = false;
    _params: object;
    _options: object;

    @Input()
    set options(options: object) {
        this._options = options;
    }

    get options(): object {
        return this._options || {};
    }

    // 报表参数
    @Input()
    set params(params: object) {
        this._params = params;
    }

    get params(): object {
        return this._params || {};
    }

    search$: Subscription;

    @Output()
    errorCallback = new EventEmitter<object>();
    errRel = {};

    @ViewChild('frame')
    frameElement: ElementRef;

    containerMinWidth: number = 0;
    containerMinHeight: number = 0;
    containerHeight: number = this.containerMinHeight;
    containerWidth: number = this.containerMinWidth;

    constructor(
        private _httpClient: HttpClient,
        private sanitizer: DomSanitizer,
        private auth: AuthService,
        private cookie: CookieService
    ) {
        if (this.options && this.options['minHeight']) {
            this.containerMinHeight = this.options['minHeight'];
        }
        if (this.options && this.options['minWidth']) {
            this.containerMinWidth = this.options['minWidth'];
        }
    }

    ngOnInit() {
        const currentGroupInfo = this.auth.currentGroupInfo;
        const url =
            environment.REPOET_URL +
            'WebReport/ReportServer?op=fs_load&cmd=sso&appCode=' +
            environment.appCode +
            '&fr_username=' +
            currentGroupInfo.userId +
            '&fr_password=' + //20d620d737dc4d4dcdaeb71332158c11
            this.cookie.getItem('token');

        this.search$ = this._httpClient.jsonp(url, 'callback').subscribe(
            data => {
                console.log(data);
                if (data['status'] && this.params) {
                    this.flag = true;
                    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.getBiUrl());
                }
            },
            err => {
                this.errorCallback.emit(err);
                this.errRel = err;
            },
            () => { }
        );
    }

    ngAfterViewInit() {
        // this.onResize(window.innerWidth, window.innerHeight); // 暂时不用自动计算高度和宽度
        if (this.options && this.options['height']) {
            this.containerHeight = this.options['height'];
        } else {
            this.containerHeight = Math.max(window.innerHeight - 230, this.containerMinHeight);
        }
    }

    getBiUrl() {
        const currentGroupInfo = this.auth.currentGroupInfo;
        let baseUrl =
            environment.REPOET_URL +
            'WebReport/ReportServer?groupType=' +
            currentGroupInfo.groupType +
            '&groupId=' +
            currentGroupInfo.groupId;
        if (this.params) {
            for (const key in this.params) {
                baseUrl += `&${key}=${this.params[key]}`;
            }
        }
        return baseUrl;
    }

    // 高度自动计算
    @HostListener('window:resize', ['$event.target.innerWidth', '$event.target.innerHeight'])
    onResize(width: number, height: number): void {
        const top = (this.frameElement ? this.frameElement.nativeElement.offsetTop : 0) + 230;
        const left = this.frameElement ? this.frameElement.nativeElement.offsetLeft : 0;
        this.containerWidth = Math.max(width - left, this.containerMinWidth);
        this.containerHeight = Math.max(height - top, this.containerMinHeight);
    }

    ngOnDestroy() {
        this.search$.unsubscribe();
    }
}
