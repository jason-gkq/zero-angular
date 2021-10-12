import { Observable } from 'rxjs/Observable';
import { UtilsService } from '@core/utils/utils.service';
import Cropper from 'cropperjs';
import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, Renderer2, TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import * as qiniu from 'qiniu-js';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
enum DragMode {
    Crop = 'crop',
    Move = 'move',
    None = 'none',
}

@Component({
    selector: 'lcb-nz-img-cropper',
    templateUrl: './lcb-nz-img-cropper.component.html',
    styleUrls: ['./lcb-nz-img-cropper.component.less']
})
export class LcbNzImgCropperComponent implements OnInit {
    @ViewChild('cropperContainer')
    cropperContainer: ElementRef;
    @ViewChild('cropperPreviewer')
    cropperPreviewer: ElementRef;
    @ViewChild('modalContent')
    modalContent: TemplateRef<any>;
    @Input() modalTitle = '图片裁剪';
    @Input() cropBoxWidth = 300;
    @Input() cropBoxHeight = 300;
    @Input()
    set prefix(prefix) {
        this.getQiniuUploadToken(prefix);
    }
    @Input() maxNum = 5;
    @Input() maxSize = 2;
    @Output() getImgList: EventEmitter<Object> = new EventEmitter();
    // isVisible;
    img;
    @Input() imgList = [];
    //区分七牛上传&接口上传
    @Input() isQiniuUpload: boolean = true;
    //接口url
    @Input() apiUploadUrl: string;
    //接口上传参数集合
    @Input() apiUploadParams: any[];
    //是否展示预览
    showConfig = { showPreviewIcon: false, showRemoveIcon: true };

    uploadInfo: any = {};
    cropper: Cropper;
    imgToCrop: HTMLImageElement;
    okLoading;
    modal: NzModalRef;
    previewImage: string | undefined = '';
    previewVisible = false;
    constructor(
        private msg: NzMessageService,
        private _renderer: Renderer2,
        private _utilSrv: UtilsService,
        private modalSrv: NzModalService
    ) { }

    ngOnInit() { }

    getQiniuUploadToken(prefix) {
        if (prefix) {
            this._utilSrv.getQiNiuUploadToken(prefix).subscribe(res => {
                this.uploadInfo.prefix = prefix;
                this.uploadInfo.token = res.token;
            });
        }
    }

    beforeUpload = (file) => {
        if (this.maxSize * 1024 * 1024 < file.size) {
            this.msg.error(`图片超过${this.maxSize}M，请重新上传`);
            return false;
        }
        this.img = file;
        this.start();
        return false;
    }
    coverListchange(evt) {
        if (evt.type === 'removed') {
            this.getImgList.emit(evt.fileList);
        }
    }

    start() {
        this.modal = this.modalSrv.create({
            nzTitle: this.modalTitle,
            nzContent: this.modalContent,
            nzWidth: 600,
            nzOnCancel: () => this.modal.destroy(),
            nzOnOk: () => this.crop(),
            nzOkLoading: this.okLoading
        });
        this.imgToCrop = null;
        if (this.cropper) {
            this.cropper.destroy();
        }
        const reader = new FileReader();
        reader.readAsDataURL(this.img);
        reader.onload = () => {
            this.createCropImg(reader.result + '');
        };
    }

    private createCropImg(imgSrc: string) {
        this.imgToCrop = this.getImg(imgSrc, () => {
            this._renderer.appendChild(this.cropperContainer.nativeElement, this.imgToCrop);
            const preview = document.querySelector('.preview');
            this.cropper = new Cropper(this.imgToCrop, {
                aspectRatio: this.cropBoxWidth / this.cropBoxHeight,
                viewMode: 1,
                preview: '.preview',
                background: false,
                modal: false,
                cropBoxResizable: false,
                dragMode: DragMode.None,
                ready: () => {
                    const canvasData = this.cropper.getCanvasData();

                    /**
                     * @description 控制裁剪区域大小
                    */
                    if (canvasData.width / canvasData.height < this.cropBoxWidth / this.cropBoxHeight) {
                        this.cropper.setCropBoxData({ width: canvasData.width <= this.cropBoxWidth ? canvasData.width : this.cropBoxWidth });
                        this.cropper.setCropBoxData({ height: (this.cropBoxHeight / this.cropBoxWidth) * this.cropper.getCropBoxData().width });
                    }

                    if (canvasData.width / canvasData.height > this.cropBoxWidth / this.cropBoxHeight) {
                        this.cropper.setCropBoxData({ height: canvasData.height <= this.cropBoxHeight ? canvasData.height : this.cropBoxHeight });
                        this.cropper.setCropBoxData({ width: (this.cropBoxWidth / this.cropBoxHeight) * this.cropper.getCropBoxData().height });
                    }

                    if (canvasData.width / canvasData.height === this.cropBoxWidth / this.cropBoxHeight) {
                        this.cropper.setCropBoxData({ width: canvasData.width <= this.cropBoxWidth ? canvasData.width : this.cropBoxWidth });
                        this.cropper.setCropBoxData({ height: canvasData.height <= this.cropBoxHeight ? canvasData.height : this.cropBoxHeight });
                    }

                    this.cropper.setCropBoxData({
                        left: canvasData.left + (canvasData.width - this.cropper.getCropBoxData().width) / 2,
                        top: canvasData.top + (canvasData.height - this.cropper.getCropBoxData().height) / 2
                    });
                },
                crop: (event) => {
                    // 预览
                    const data = event.detail;
                    const previewAspectRatio = data.width / data.height;
                    const previewWidth = 100;
                    const previewHeight = previewWidth / previewAspectRatio;

                    const imageData = this.cropper.getImageData();
                    const previewImage = preview.getElementsByTagName('img').item(0);
                    const imageScaledRatio = data.width / previewWidth;

                    preview['style'].width = previewWidth + 'px';
                    preview['style'].height = previewHeight + 'px';
                    preview['style'].float = 'left';
                    preview['style'].overflow = 'hidden';

                    previewImage.style.width = imageData.naturalWidth / imageScaledRatio + 'px';
                    previewImage.style.height = imageData.naturalHeight / imageScaledRatio + 'px';

                    previewImage.style.marginLeft = -data.x / imageScaledRatio + 'px';
                    previewImage.style.marginTop = -data.y / imageScaledRatio + 'px';
                }
            });
        });
    }

    private getImg(imgSrc: string, onloadCallback: () => void, width?: number, height?: number, imgAlt?: string) {
        const img = new Image();
        img.onload = () => {
            onloadCallback();
        };
        img.src = imgSrc;
        if (typeof imgAlt === 'string') {
            img.alt = imgAlt;
        }
        if (typeof width === 'number') {
            img.width = width;
        }
        if (typeof height === 'number') {
            img.height = height;
        }
        return img;
    }

    crop() {
        return new Promise((resolve, reject) => {
            this.okLoading = true;
            let croppedResult;
            const croppedCanvas = this.cropper.getCroppedCanvas({
                width: this.cropBoxWidth,
                height: this.cropBoxHeight
            });
            croppedCanvas.toBlob(blobObj => {
                croppedResult = blobObj;
                const suffix = this.img.name.split('.')[1];
                const resourceName = `${this._utilSrv.guid()}.${suffix}`;
                if (this.isQiniuUpload) {
                    qiniu.upload(croppedResult, this.uploadInfo.prefix + resourceName, this.uploadInfo.token, { fname: this.img.name }).subscribe(next => {
                    }, err => {
                        this.msg.error('裁剪发生错误,请再次点击确定按钮');
                        this.okLoading = false;
                        reject();
                    }, complete => {
                        this.okLoading = false;
                        this.img.response = complete;
                        this.img.url = complete.result.qiniuUrl;
                        this.imgList.push(this.img);
                        const tmpImgList = Object.assign([], this.imgList);
                        this.imgList = tmpImgList;
                        this.getImgList.emit(this.imgList);
                        this.msg.success('裁剪成功');
                        resolve('');
                    });
                } else {
                    const reader = new FileReader();
                    reader.readAsDataURL(blobObj);
                    reader.onload = (e: any) => {
                        const imgUrl = e.target.result;

                        //这里需要apiUploadParams第一个对象  为File(必须)
                        this.apiUploadParams[0].value = this.dataURLtoFile(imgUrl, this.img.name);
                        this._utilSrv.getShowcaseTarget({ url: this.apiUploadUrl, paramsArr: this.apiUploadParams }).pipe(
                            catchError((val) => of(val))
                        ).subscribe((data) => {
                            if (data) {
                                this.okLoading = false;
                                this.img.response = data;
                                this.img.url = imgUrl;
                                this.imgList.push(this.img);
                                const tmpImgList = Object.assign([], this.imgList);
                                this.imgList = tmpImgList;
                                this.getImgList.emit(this.imgList);
                                this.msg.success('裁剪成功');
                                resolve('');
                            }
                        }, err => {
                            this.msg.error('裁剪发生错误,请再次点击确定按钮');
                            this.okLoading = false;
                            reject();
                        });

                    };
                }
            }, 'image/jpeg');
        });
    }
    dataURLtoFile(dataurl, filename) {
        const arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    handlePreview = (file: NzUploadFile) => {
        this.previewImage = file.url || file.thumbUrl;
        this.previewVisible = true;
    }
}
