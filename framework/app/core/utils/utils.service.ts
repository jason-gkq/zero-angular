import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import * as qiniu from 'qiniu-js';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from '@env/main';
import { SessionStorageService } from '@core/cache/session-storage.service';
import { CookieService } from '@core/cache/cookie.service';

@Injectable()
export class UtilsService {

    constructor(
        private _http: HttpClient,
        private _ngZone: NgZone,
        private _msgSrv: NzMessageService,
        private _sessionSrv: SessionStorageService,
        private _cookieSrv: CookieService,
    ) { }

    /**
     * @description 获取Guid
     *
     */
    guid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c): string {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * @description 获取rangePicker中的格式化后的
     *
     */

    getRangeDateFormattedValue(dateArray: Date[] | null, pattern: string = 'YYYY-MM-DD'): Array<string | null> {
        const startIndex = 0;
        const endIndex = 1;
        let start = null;
        let end = null;
        if (dateArray !== null) {
            start = dateArray[startIndex] ? moment(dateArray[startIndex]).format(pattern) : null;
            end = dateArray[endIndex] ? moment(dateArray[endIndex]).format(pattern) : null;
        }
        return [start, end];
    }

    /**
     * 获取全域名
     * @returns {string}
     */
    getDomain(): string {
        const ret = location.hostname.split('.');

        if (ret.length > 1) {
            // ip情况
            if (/^\d+$/.test(ret[0])) {
                return ret.join('.');
            } else {
                return '.' + ret[ret.length - 2] + '.' + ret[ret.length - 1];
            }
        } else {
            return ret[0];
        }
    }

    /**
     * 获取根域名
     * @returns {string}
     */
    static getRootDomain(): string {
        const ret = location.hostname.split('.');

        if (ret.length > 1) {
            // ip情况
            if (/^\d+$/.test(ret[0])) {
                delete ret[0];
                return ret.join('.');
            } else {
                if (ret.length === 4) {
                    return '.' + ret[ret.length - 3] + '.' + ret[ret.length - 2] + '.' + ret[ret.length - 1];
                } else {
                    return '.' + ret[ret.length - 2] + '.' + ret[ret.length - 1];
                }
            }
        } else {
            return ret[0];
        }
    }

    getUploadToken(url: string): Observable<any> {
        return this._http.post(url, {});
    }

    /**
     * @description 七牛上传服务 需要配合nz-uploader组件使用。方法返回 自定义上传对象，用得到的 自定义上传对象 设置nz-uploader组件的 [nzCustomRequset] 属性。
     * @param token
     * @param prefix
     *
     * @returns customRequest
     */
    getQiNiuUploadRequest(token: string, prefix: string = '', fileName?: string): (uploadEvent: {
        onProgress: (event: { percent: number }) => void
        onError: (event: Error) => void
        onSuccess: (body: Object, xhr?: Object) => void
        data: object
        file: File
        withCredentials: boolean
        action: string
        headers: object
    }) => void {
        const customRequest = (uploadEvent: {
            onProgress: (event: { percent: number }) => void
            onError: (event: Error) => void
            onSuccess: (body: Object, xhr?: Object) => void
            data: object
            file: File
            withCredentials: boolean
            action: string
            headers: object
        }) => {
            const { file } = uploadEvent;
            const suffix = file.name.substring(file.name.lastIndexOf('.') + 1);
            let resourceName;
            fileName ? resourceName = `${fileName}.${suffix}` : resourceName = `${this.guid()}.${suffix}`;
            const observable = qiniu.upload(file, prefix + resourceName, token, { fname: file.name });
            observable.subscribe({
                next: (res: { total: any }) => {
                    this._ngZone.run(() => {
                        const { total } = res;
                        uploadEvent.onProgress({ percent: total.percent });
                    });
                },
                error: (err) => {
                    this._ngZone.run(() => {
                        uploadEvent.onError(err);
                    });
                },
                complete: (res) => {
                    this._ngZone.run(() => {
                        uploadEvent.onSuccess(res);
                    });
                }
            });
        };
        return customRequest;
    }

    /**
     * 乘法运算：解决浮点运算bug
     * @param arg1
     * @param arg2
     */
    accMul(arg1, arg2) {
        let m = 0;
        const s1 = `${arg1}`;
        const s2 = `${arg2}`;
        try {
            m += s1.split('.')[1].length;
        } catch (e) { }
        try {
            m += s2.split('.')[1].length;
        } catch (e) { }
        return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
    }


    /**
     * @description 获取七牛的上传Token
     *
     * @param path 七牛上传空间名，一般需要找后端确定
     * @param count 后端生成文件名的个数
     *
     */
    getQiNiuUploadToken(path: string, count?: number) {
        return this._http.post<{
            host: string,
            paths: string[],
            token: string
        }>('gateway/common/file/api/attachment/getUploadToken', {
            path,
            count
        });
    }

    /**
     * range datePicker, 返回[YYYY-MM-DD 00:00:00,YYYY-MM-DD 23:59:59]格式的毫秒值
     * @param rangeDate
     */
    getRangeTimeForDay(rangeDate: Date[] = [null, null]) {
        if (!rangeDate || !rangeDate[0]) {
            return [null, null];
        } else {
            return [moment(rangeDate[0]).startOf('d').valueOf(), moment(rangeDate[1]).endOf('d').valueOf()];
        }
    }

    /**
     * 列表删除为当前页最后一条数据时，重新请求列表数据currentPage参数应为上一页
     * @param list 当前列表数据
     * @param page 当前分页数据
     */
    getPaginationAfterDelete(list, page) {
        const newPage = page;
        if (list && list.length <= 1) {
            if (page.currentPage > 1) {
                newPage.currentPage = newPage.currentPage - 1;
            }
        }
        return newPage;
    }

    /**
     * 多用于查询输入条件，输入字符清除后，该字段处理为null（不作处理值为''，搜索结果将产生误差）
     * @param value input输入值
     */
    handleInputValue(value) {
        if (value) {
            if (value.trim()) {
                return value.trim();
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    /**
         * 接口上传文件-裁剪
         * @param params
         */
    getShowcaseTarget(params: any): Observable<any> {
        const header = new HttpHeaders().set('X-Request-Info', this.getRequestInfo());
        const formData = new FormData();
        const paramsArr = params.paramsArr || [];
        paramsArr.map(item => {
            formData.append(item.name, item.value);
        });
        return this._http.post(params.url, formData, {
            headers: header,
        });
    }

    /**
     * 自定义上传接口
     * @param params
     */
    customizedUpload(params: { url: string, paramsArr: any, options?: any }): Observable<any> {
        const header = new HttpHeaders().set('X-Request-Info', this.getRequestInfo());
        const formData = new FormData();
        const paramsArr = params.paramsArr || [];
        paramsArr.map(item => {
            formData.append(item.name, item.value);
        });
        let options;
        if (options) {
            options = Object.assign({}, params.options, header);
        } else {
            options = { headers: header };
        }
        return this._http.post(params.url, formData, options);
    }

    private getRequestInfo(): string {
        const groupInfo = Object.assign({ groupId: null, groupType: null }, this._sessionSrv.get('currentGroupInfo'));
        let info = `appCode=${environment.appCode};`;
        info += `token=${this.getToken()};`;
        info += `groupId=${groupInfo.groupId};`;
        info += `groupType=${groupInfo.groupType};`;
        info += `__clientId=${this.getClientId()};`;
        info += `__requestId=${this.guid()}`;
        return info;
    }
    public getToken() {
        return this._cookieSrv.getItem('token') || '';
    }

    private getClientId(): string {
        let cleintId = this._cookieSrv.getItem('__clientId');
        if (!cleintId) {
            cleintId = this.guid();
            this._cookieSrv.setItem('__clientId', cleintId, Infinity, '/', this._cookieSrv.getDomain());
        }
        return cleintId;
    }

    get isChebaba() {
        return environment['manufacturer'] === 'chebaba' ? true : false;
    }

    public setCookieDomains(key: any, value: string): void {
        if (environment.production) {
            this._cookieSrv.setItem(key, value, Infinity, '/', '.lechebang.com');
            this._cookieSrv.setItem(key, value, Infinity, '/', '.edndc.com');
        } else {
            this._cookieSrv.setItem(key, value, Infinity, '/', this._cookieSrv.getDomain());
            this._cookieSrv.setItem(key, value, Infinity, '/', '.lechebang.cn');
            this._cookieSrv.setItem(key, value, Infinity, '/', '.edndc.cn');
        }
    }

    /**
     * nz-upload nzBeforeUpload params check
     * @param file
     * @param params maxSize：文件大小限制（M）；fileTypes: 文件类型限制；width: 图片宽度限制；height：图片高度限制
     */
    beforeUpload(file: File, params?: { maxSize?: number; fileTypes?: string[]; width?: number; height?: number; }) {
        return new Observable(observer => {
            if (!params) {
                observer.next(true);
                observer.complete();
                return;
            }
            const { maxSize, fileTypes, width, height } = params;
            // 文件类型
            if (fileTypes) {
                if (!fileTypes.includes(file.type.toLowerCase())) {
                    this._msgSrv.error('图片格式不正确！');
                    observer.complete();
                    return;
                }
            }
            // 文件大小
            if (maxSize) {
                if (maxSize * 1024 * 1024 < file.size) {
                    this._msgSrv.error(`图片必须小于${maxSize}M！`);
                    observer.complete();
                    return;
                }
            }
            // 图片宽高检测
            if (width || height) {
                this.checkImageDimension(file, width, height).then(dimensionRes => {
                    if (dimensionRes.overSize) {
                        let overSizeMsg;
                        switch (dimensionRes.type) {
                            case 1:
                                overSizeMsg = `图片宽度不能超过${width}，高度不能超过${height}！`;
                                break;
                            case 2:
                                overSizeMsg = `图片宽度不能超过${width}！`;
                                break;
                            case 3:
                                overSizeMsg = `图片高度不能超过${height}！`;
                                break;
                            default:
                                break;
                        }
                        this._msgSrv.error(overSizeMsg);
                        observer.complete();
                        return;
                    }
                    observer.next(true);
                    observer.complete();
                });
            }
        });
    }

    private checkImageDimension(file: File, width, height): Promise<any> {
        return new Promise(resolve => {
            const img = new Image();
            img.src = window.URL.createObjectURL(file);
            img.onload = () => {
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                window.URL.revokeObjectURL(img.src);
                if (width && height) {
                    resolve({
                        overSize: naturalWidth > width || naturalHeight > height,
                        type: 1
                    });
                } else if (width) {
                    resolve({
                        overSize: naturalWidth > width,
                        type: 2
                    });
                } else {
                    resolve({
                        overSize: naturalHeight > height,
                        type: 3
                    });
                }
            };
        });
    }
}
