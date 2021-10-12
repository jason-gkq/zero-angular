import { Component, OnInit, Input, Output, EventEmitter, ApplicationRef, NgZone } from '@angular/core';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import * as qiniu from 'qiniu-js';
import { UtilsService } from '@core/utils/utils.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'lcb-img-uploader',
    templateUrl: './lcb-img-uploader.component.html',
    styleUrls: ['./lcb-img-uploader.component.less']
})
export class LcbImgUploaderComponent implements OnInit {

    /**
     * @type {string}
     * @description 七牛上传token
     */
    @Input()
    uploadToken: string = '';

    /**
     * @type {UploadFile[]}
     * @description 文件列表 可双向绑定
     */
    @Input()
    imgList: NzUploadFile[] = [];

    /**
     * @type {($event)=> void}
     * @description 文件列表改变时的回调
     */
    @Output()
    imgListChange: EventEmitter<NzUploadFile[]> = new EventEmitter<NzUploadFile[]>();

    /**
     * @type {number}
     * @description 文件大小限制
     */
    @Input()
    maxSize: number = 3;

    /**
     * @type {(file: UploadFile, fileList: UploadFile[]) => boolean | Observable<boolean>}
     * @description 文件上传前的校验
     */
    @Input()
    uploadValidator: (file: NzUploadFile, fileList: NzUploadFile[]) => boolean | Observable<boolean> = null;

    /**
    * @type {string}
    * @description 文件保存时文件名前缀
    */
    @Input()
    saveNamePrefix: string = '';

    /**
    * @type {boolean}
    * @description 组件当前是否可用的状态
    */
    @Input()
    nzDisabled: boolean;

    /**
     * @type {number}
     * @description 最大文件数
     */
    @Input()
    maxLength: number = 10;

    /**
     * @type {($event)=> void}
     * @description 文件上传发生错误时的回调
     */
    @Output()
    onError: EventEmitter<any> = new EventEmitter<any>();

    /**
     * @type {($event)=> void}
     * @description 文件上传成功时的回调
     */
    @Output()
    onSuccess: EventEmitter<any> = new EventEmitter<any>();

    /**
     * @type {($event)=> void}
     * @description 文件上传中的回调
     */
    @Output()
    onProgress: EventEmitter<{ percent: number }> = new EventEmitter<{ percent: 0 }>();

    /**
     * @type {($event)=> void}
     * @description 预览图片的回调
     */
    @Output()
    onPreview: EventEmitter<NzUploadFile> = new EventEmitter<NzUploadFile>();

    /**
     * @type {($event)=> void}
     * @description 删除图片的回调
     */
    @Output()
    onRemove: EventEmitter<NzUploadFile> = new EventEmitter<NzUploadFile>();

    @Output()
    onChange: EventEmitter<any> = new EventEmitter<any>();

    private allowType = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'];

    constructor(
        private _utilSrv: UtilsService,
        private _ngZone: NgZone
    ) { }

    ngOnInit(): void {

    }

    getFileList(fileList) {
        return fileList.filter(item => !this.imgList.find(img => img.uid === item.uid));
    }

    beforeUpload = (file: NzUploadFile, fileList: NzUploadFile[]) => {
        const err = new Error();
        err.name = '文件上传发生错误';
        if (this.imgList.length + this.getFileList(fileList).length > this.maxLength) {
            err.message = `超过最大张数`;
            this.onError.emit(err);
            return false;
        }

        if (this.uploadToken.length < 1) {
            err.message = `没有设置上传Token，无法上传`;
            this.onError.emit(err);
            return false;
        }

        if (this.allowType.indexOf(file.type) < 0) {
            err.message = `只支持jpg,png,jpeg,gif格式`;
            this.onError.emit(err);
            return false;
        }

        if (file.size > this.maxSize * 1024 * 1024) {
            err.message = `文件超出大小限制，最大不能超过${this.maxSize}M`;
            this.onError.emit(err);
            return false;
        }

        if (this.uploadValidator) {
            return this.uploadValidator(file, fileList);
        }
        return true;
    }

    customRequest = (uploadEvent: {
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
        const resourceName = `${this._utilSrv.guid()}.${suffix}`;
        const observable = qiniu.upload(file, this.saveNamePrefix + resourceName, this.uploadToken, { fname: file.name });
        observable.subscribe({
            next: (res: { total: any }) => {
                this._ngZone.run(() => {
                    const { total } = res;
                    this.onProgress.emit({ percent: total.percent });
                    uploadEvent.onProgress({ percent: total.percent });
                });
            },
            error: (err) => {
                this._ngZone.run(() => {
                    this.onError.emit(err);
                    uploadEvent.onError(err);
                });
            },
            complete: (res) => {
                this._ngZone.run(() => {
                    this.onSuccess.emit(res);
                    uploadEvent.onSuccess(res);
                });
            }
        });
    }

    handlePreview = (file: NzUploadFile) => {
        this.onPreview.emit(file);
    }

    handleRemove = (file: NzUploadFile) => {
        this.onRemove.emit(file);
        return true;
    }

    handleImgListChange(change: NzUploadFile[]) {
        this.imgListChange.emit(change);
    }

    handleOnChange(evt) {
        this.onChange.emit(evt);
    }
}
