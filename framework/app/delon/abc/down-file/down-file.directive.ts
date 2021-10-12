import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { SessionStorageService } from '@core/cache/session-storage.service';
import { environment } from '@env/environment';
import { saveAs } from 'file-saver';
import { UtilsService } from '@core/utils/utils.service';
import * as _ from 'lodash';
import { CookieService } from '@core/cache/cookie.service';
/**
 * 文件下载
 *
 * ```html
 * <button nz-button down-file http-url="assets/demo{{i}}" file-name="demo中文">{{i}}</button>
 * ```
 */
@Directive({ selector: '[down-file]' })
export class DownFileDirective {
    /** URL请求参数 */
    @Input('http-data') httpData: any;
    /** 请求类型 */
    @Input('http-method') httpMethod: string = 'post';
    /** 下载地址 */
    @Input('http-url') httpUrl: string;
    /** 指定文件名，若为空从服务端返回的 `header` 中获取 `filename`、`x-filename` */
    @Input('file-name') fileName: string;
    /** 成功回调 */
    @Output() success: EventEmitter<any> = new EventEmitter<any>();
    /** 错误回调 */
    @Output() error: EventEmitter<any> = new EventEmitter<any>();

    constructor(private el: ElementRef,
        private http: HttpClient,
        private session: SessionStorageService,
        private utils: UtilsService,
        private cookie: CookieService
    ) { }

    @HostListener('click')
    _click() {
        this.el.nativeElement.disabled = true;
        const groupInfo = Object.assign({ groupId: null, groupType: null }, this.session.get('currentGroupInfo'));

        const lcb_request_id = this.utils.guid();
        const info = this.setRequestInfo(lcb_request_id);
        const header = new HttpHeaders()
            .set('Accept', '*/*') // application/json, text/javascript, */*; q=0.01
            .set('Content-type', 'application/json')
            .set('X-Request-Info', `${info}`);

        this.http
            .request(this.httpMethod, this.httpUrl, {
                headers: header,
                body: Object.assign({
                    lcb_request_id: this.utils.guid(),
                    appCode: environment.appCode,
                    groupId: groupInfo.groupId,
                    groupType: groupInfo.groupType
                }, this.httpData),
                responseType: 'blob',
                observe: 'response',
                withCredentials: true,
            })
            .subscribe(
                (res: HttpResponse<Blob>) => {
                    if (res.status !== 200 || res.body.size <= 0 || res.body.type === 'application/json') {
                        this.error.emit(res);
                        return;
                    }
                    const fileName = this.fileName || this.getFilename(res.headers.get('content-disposition'));

                    saveAs(res.body, decodeURI(fileName));
                    this.success.emit(res);
                    this.el.nativeElement.disabled = false;
                },
                err => {
                    this.error.emit(err);
                    this.el.nativeElement.disabled = false;
                },
            );
    }

    private getFilename(disposition: string) {
        if (!disposition) {
            return 'fileName';
        }
        const tmpArr = disposition.split('=');
        if (!tmpArr || tmpArr.length !== 2) {
            return 'fileName';
        }
        return _.trim(tmpArr[1], '"').split('.')[0] || 'fileName';
    }

    // appCode appId token groupId groupType __clientId __requestId
    private setRequestInfo(requestId): string {
        const groupInfo = Object.assign({ groupId: null, groupType: null }, this.session.get('currentGroupInfo'));

        // let info = [];
        let info = `appCode=${environment.appCode};`;
        info += `token=${this.getToken()};`;
        info += `groupId=${groupInfo.groupId};`;
        info += `groupType=${groupInfo.groupType};`;
        info += `__clientId=${this.getClientId()};`;
        info += `__requestId=${requestId}`;
        return info;
    }

    private getToken() {
        return this.cookie.getItem('token') || '';
    }

    private getClientId(): string {
        let cleintId = this.cookie.getItem('__clientId');
        if (!cleintId) {
            cleintId = this.utils.guid();
            this.utils.setCookieDomains('__clientId', cleintId);
            // this.cookie.setItem('__clientId', cleintId, Infinity, '/', this.cookie.getDomain());
        }
        return cleintId;
    }
}
