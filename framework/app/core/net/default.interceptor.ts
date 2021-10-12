import { CookieService } from './../cache/cookie.service';
import {
    HttpErrorResponse,
    HttpHandler,
    HttpHeaderResponse,
    HttpHeaders,
    HttpInterceptor,
    HttpProgressEvent,
    HttpRequest,
    HttpResponse,
    HttpSentEvent,
    HttpUserEvent
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '@core/cache/local-storage.service';
import { UtilsService } from '@core/utils/utils.service';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { catchError, mergeMap } from 'rxjs/operators';
import { SessionStorageService } from '../cache/session-storage.service';

interface IResponseBody {
    costTime: number;
    msg: string;
    result: any;
    resultCode: number;
    statusCode: number;
    validationErrors: any;
}

/**
 * 自定义错误类型
 * @param err
 */
export function LcbError(err: any) {
    Object.keys(err).forEach(key => {
        this[key] = err[key];
    });
}

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
    constructor(
        private injector: Injector,
        private session: SessionStorageService,
        private local: LocalStorageService,
        private cookie: CookieService
    ) { }

    private static WHITE_LIST = [
        'http://up.qiniu.com',
        'https://up.qiniu.com',
        'http://upload.qiniup.com',
        'https://upload.qiniup.com',
        'http://up-z1.qiniu.com',
        'https://up-z1.qiniu.com',
        'http://upload-z1.qiniup.com',
        'https://upload-z1.qiniup.com',
        'http://up-z2.qiniu.com',
        'https://up-z2.qiniu.com',
        'http://upload-z2.qiniup.com',
        'https://upload-z2.qiniup.com',
        'https://upload.qiniup.com/putb64/-1',
        'http://upload.qiniup.com/putb64/-1',
        'gateway/saas/ext/order/download/get',
        'gateway/common/file/api/download/downloadFile',
        'gateway/micro/data/api/fitting/uploadFitting',
        'gateway/common/file/api/upload/uploadFile',
        'gateway/common/file/api/wechat/media/uploadMedia',
        'gateway/manage/store/wechat/saasMaterial/addMaterial',
        'gateway/common/file/api/download/downloadBatchOriginalFile'
    ];

    get msg(): NzMessageService {
        return this.injector.get(NzMessageService);
    }

    get utils(): UtilsService {
        return this.injector.get(UtilsService);
    }

    private goTo(url: string) {
        setTimeout(() => this.injector.get(Router).navigateByUrl(url));
    }

    private handleData(event: HttpResponse<any> | HttpErrorResponse): Observable<any> {
        // 可能会因为 `throw` 导出无法执行 `_HttpClient` 的 `end()` 操作
        this.injector.get(_HttpClient).end();
        // 业务处理：一些通用操作
        switch (event.status) {
            case 200:
                // 业务层级错误处理，以下是假定restful有一套统一输出格式（指不管成功与否都有相应的数据格式）情况下进行处理
                // 例如响应内容：
                //  错误内容：{ status: 1, msg: '非法参数' }
                //  正确内容：{ status: 0, response: {  } }
                // 则以下代码片断可直接适用
                if (event instanceof HttpResponse) {
                    const body: IResponseBody = event.body;
                    const resultCode = body ? Number(body.resultCode) : null;
                    if (body && body.statusCode) {
                        const number = Number(body.statusCode);
                        if (number === 200) {
                            // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
                            return of(Object.assign(event, { body: body.result }));
                            // 或者依然保持完整的格式
                            // return of(event);
                        } else if (number === 904 || number === 907 || number === 8800111) {
                            this.session.clearAll();
                            this.local.clearAll();
                            this.goTo('/user/login');
                        } else if (body.msg) {
                            if (!environment['handleError']) {
                                this.msg.error(body.msg);
                            }
                        }
                    }
                    // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
                    // this.http.get('/').subscribe() 并不会触发
                    // 200:业务校验通过；409：接口参数校验失败 不发送日志
                    if (resultCode === 200 || resultCode === 409) {
                        return throwError(new LcbError(body));
                    } else {
                        return throwError(body);
                    }
                }
                break;
            case 904: // 未登录状态码
                this.session.clearAll();
                this.local.clearAll();
                this.goTo('/user/login');
                return throwError(new LcbError({ result: '用户未登录', validationErrors: null }));
            case 403:
            case 404:
            case 500:
                this.goTo(`/${event.status}`);
                break;
            default:
                if (event['name'] && event['name'] === 'TimeoutError') {
                    console.warn('请求超时', event);
                    this.msg.error('请求超时');
                    return throwError(new LcbError({ result: '请求超时', validationErrors: null }));
                }
                if (event instanceof HttpErrorResponse) {
                    console.warn('未可知错误，大部分是由于后端不支持CORS或无效配置引起', event);
                    this.msg.error(event.message || '服务异常，请联系管理员');
                    return throwError(new LcbError({
                        result: '未可知错误，大部分是由于后端不支持CORS或无效配置引起',
                        validationErrors: null
                    }));
                }
                break;
        }
        return of(event);
    }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
        // 统一加上服务端前缀
        let url = req.url;
        if (req.method === 'GET') {
            url = environment.HOST + '/' + url;
            return next.handle(req.clone({ url: url }));
        } else if (!url.startsWith('https://') && !url.startsWith('http://')) {
            url = environment.SERVER_URL + url;
        }

        if (DefaultInterceptor.WHITE_LIST.indexOf(req.url) > -1) {
            return next.handle(req.clone({ url: url }));
        }

        const groupInfo = Object.assign({ groupId: null, groupType: null }, this.session.get('currentGroupInfo'));
        const lcb_request_id = this.utils.guid();
        const token = this.getToken();
        const info = this.setRequestInfo({ requestId: lcb_request_id, token, groupInfo });
        const header = new HttpHeaders()
            .set('Accept', '*/*') // application/json, text/javascript, */*; q=0.01
            .set('Content-type', 'application/json')
            .set('X-Request-Info', `${info}`);

        const body = req.body;

        const newReq = req.clone({
            url: url,
            withCredentials: true,
            headers: header,
            body: Object.assign(
                {
                    lcb_request_id: lcb_request_id,
                    appCode: environment.appCode,
                    groupId: groupInfo.groupId,
                    groupType: groupInfo.groupType,
                    token: token
                },
                body
            )
        });
        const timeout = parseInt(req.params.get('timeout'), 0) || 10000;
        return next
            .handle(newReq)
            .timeout(timeout)
            .pipe(
                mergeMap((event: any) => {
                    // 允许统一对请求错误处理，这是因为一个请求若是业务上错误的情况下其HTTP请求的状态是200的情况下需要
                    if (event instanceof HttpResponse && event.status === 200) {
                        const rBody: IResponseBody = event.body;
                        if (rBody && Number(rBody.statusCode) === 200) {
                            // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
                            return of(Object.assign(event, { body: rBody.result }));
                        } else {
                            // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
                            // this.http.get('/').subscribe() 并不会触发
                            return throwError(event);
                        }
                    }
                    // 若一切都正常，则后续操作
                    return of(event);
                }),
                catchError((err: HttpErrorResponse) => this.handleData(err))
            );
    }

    // appCode appId token groupId groupType __clientId __requestId
    private setRequestInfo({ requestId, token, groupInfo }): string {
        // let info = [];
        let info = `appCode=${environment.appCode};`;
        info += `token=${token};`;
        info += `groupId=${groupInfo.groupId};`;
        info += `groupType=${groupInfo.groupType};`;
        info += `__clientId=${this.getClientId()};`;
        info += `__requestId=${requestId}`;
        return info;
    }

    private getToken() {
        return this.cookie.getItem('token') || '';
    }

    // private getGroupInfo() {
    //     let groupInfo = { groupId: null, groupType: null };
    //     const groupKey = this.cookie.getItem(environment.prefix + 'currentStore');
    //     if (groupKey) {
    //         const tempCookie = groupKey.split('|');
    //         groupInfo = Object.assign(groupInfo, {
    //             groupType: tempCookie[0],
    //             groupId: tempCookie[1],
    //         });
    //     }
    //     if (this.session.get('currentGroupInfo')) {
    //         groupInfo = Object.assign(groupInfo, this.session.get('currentGroupInfo'));
    //     }
    //     return groupInfo;
    // }

    private getClientId(): string {
        let cleintId = this.cookie.getItem('__clientId');
        if (!cleintId) {
            cleintId = this.utils.guid();
            // this.cookie.setItem('__clientId', cleintId, Infinity, '/', this.cookie.getDomain());
            this.utils.setCookieDomains('__clientId', cleintId);

        }
        return cleintId;
    }
}
