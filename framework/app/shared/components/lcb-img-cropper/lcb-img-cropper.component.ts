import { Component, OnInit, ViewChild, ElementRef, NgZone, Renderer2, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import Cropper from 'cropperjs';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';

enum DragMode {
    Crop = 'crop',
    Move = 'move',
    None = 'none',
}
@Component({
    selector: 'lcb-img-cropper',
    templateUrl: './lcb-img-cropper.component.html',
    styleUrls: ['./lcb-img-cropper.component.less']
})
export class LcbImgCropperComponent implements OnInit, OnDestroy {

    @ViewChild('cropperContainer')
    cropperContainer: ElementRef;

    @ViewChild('cropperPreviewer')
    cropperPreviewer: ElementRef;

    @Input()
    isRound: boolean;

    @Input()
    shapeOnly: boolean;

    @Input()
    maxSize: number;

    cropper: Cropper;

    fileList: NzUploadFile[] = [];

    imgToCrop: HTMLImageElement;

    croppedResult: string = null;

    _cropBoxWidth;
    initCropBoxWidth;
    @Input()
    set cropBoxWidth(cropBoxWidth: number) {
        this._cropBoxWidth = cropBoxWidth ? cropBoxWidth : 0;
        this.initCropBoxWidth = this._cropBoxWidth;
    }
    get cropBoxWidth() {
        return this.initCropBoxWidth;
    }
    _cropBoxHeight;
    initCropBoxHeight;
    @Input()
    set cropBoxHeight(cropBoxHeight: number) {
        this._cropBoxHeight = cropBoxHeight ? cropBoxHeight : 0;
        this.initCropBoxHeight = this._cropBoxHeight;
    }
    get cropBoxHeight() {
        return this.initCropBoxHeight;
    }

    @Output()
    onCrop: EventEmitter<string> = new EventEmitter<string>(null);

    @Input()
    autoScale: boolean = false;
    @Input()
    boxResizable: boolean = true;

    @Input()
    cropperAccpetUrl: string = '';

    @Input()
    cropperControls: boolean = false;

    scaleX: number = 1;
    scaleY: number = 1;

    constructor(
        private _renderer: Renderer2,
        private _msgSrv: NzMessageService
    ) { }

    ngOnInit() {
        if (this.cropperAccpetUrl) {
            if (this.cropperAccpetUrl.startsWith('data:image')) {
                this.createCropImg(this.cropperAccpetUrl);
            } else {
                const self = this;
                const img = document.createElement('img');
                img.setAttribute('crossOrigin', 'Anonymous');
                img.src = this.cropperAccpetUrl;
                img.onload = function () {
                    self.createCropImg(self.getBase64Image(img));
                };
            }
        }
    }

    private getBase64Image(img: HTMLImageElement) {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const dataURL = canvas.toDataURL('image/png');
        return dataURL;
    }

    ngOnDestroy() {
        if (this.cropper) {
            this.cropper.destroy();
        }
    }

    beforeUpload = (file): boolean | Observable<boolean> => {

        if (this.imgToCrop) {
            this._renderer.removeChild(this.cropperContainer.nativeElement, this.imgToCrop);
            this.imgToCrop = null;
        }

        if (this.cropper) {
            this.cropper.destroy();
        }

        const observable = new Observable<boolean>((observer) => {
            if (this.maxSize && this.maxSize * 1024 * 1024 < file.size) {
                this._msgSrv.error('图片尺寸过大，请重新上传');
                observer.complete();
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                this.createCropImg(reader.result + '');
                observer.next(false);
                observer.complete();
            };
        });

        return observable;
    }


    private createCropImg(imgSrc: string) {
        this.imgToCrop = this.getImg(imgSrc, () => {
            this._renderer.appendChild(this.cropperContainer.nativeElement, this.imgToCrop);
            const preview = document.querySelector('.preview');
            this.cropper = new Cropper(this.imgToCrop, {
                aspectRatio: this.cropBoxWidth / this.cropBoxHeight,
                viewMode: 1,
                cropBoxResizable: this.boxResizable,
                dragMode: DragMode.None,
                preview: '.preview',
                background: false,
                modal: false,
                ready: () => {
                    const canvasData = this.cropper.getCanvasData();
                    // if (this.cropBoxWidth && this.cropBoxHeight) {
                    //     this.cropper.setCropBoxData({
                    //         width: this.cropBoxWidth,
                    //         height: this.cropBoxHeight
                    //     });
                    // }
                    // if (this.autoScale && (canvasData.naturalWidth < this.cropBoxWidth || canvasData.naturalHeight < this.cropBoxHeight)) {
                    //     this.scaleX = this.cropBoxWidth / canvasData.width;
                    //     this.scaleY = this.cropBoxHeight / canvasData.height;
                    //     this.cropper.scale(this.scaleX, this.scaleY);
                    //     canvasData = this.cropper.getCanvasData();
                    //     this.cropper.setCropBoxData({
                    //         left: canvasData.left,
                    //         top: canvasData.top
                    //     });
                    // } else {
                    //     this.scaleX = 1;
                    //     this.scaleY = 1;
                    // }

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
                    // const cropperData = this.cropper.getCropBoxData();
                    // this._cropBoxWidth = Math.floor(cropperData.width);
                    // this._cropBoxHeight = Math.floor(cropperData.height);

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

                    // 缩放后移动距离
                    // const canvasData = this.cropper.getCanvasData();
                    // if (this.autoScale && (canvasData.naturalWidth < this.cropBoxWidth || canvasData.naturalHeight < this.cropBoxHeight)) {
                    //     previewImage.style.marginLeft = -previewWidth * (1 - this.scaleX) - data.x / imageScaledRatio + 'px';
                    //     previewImage.style.marginTop = -previewHeight * (1 - this.scaleY) - data.y / imageScaledRatio + 'px';
                    // }

                    previewImage.style.marginLeft = -data.x / imageScaledRatio + 'px';
                    previewImage.style.marginTop = -data.y / imageScaledRatio + 'px';
                }
            });
        });
    }

    private getImg(imgSrc: string, onloadCallback: () => void, width?: number, height?: number, imgAlt?: string, ) {
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

    toCrop(): string {
        if (!this.isRound) {
            this.croppedResult = this.cropper.getCroppedCanvas({
                width: this._cropBoxWidth,
                height: this._cropBoxHeight
            }).toDataURL('image/jpeg');
        } else {
            this.croppedResult = this.getRoundedCanvas(this.cropper.getCroppedCanvas({
                width: this._cropBoxWidth,
                height: this._cropBoxHeight
            })).toDataURL('image/jpeg');
        }
        this.onCrop.emit(this.croppedResult);
        return this.croppedResult;
    }

    handleCropBoxResize(val: string, key: string) {
        this.cropper.setCropBoxData({
            [key]: Number(val)
        });
    }

    private getRoundedCanvas(sourceCanvas: HTMLCanvasElement) {
        const canvas = (this._renderer.createElement('canvas') as HTMLCanvasElement);
        const context = canvas.getContext('2d');
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;

        if (width !== 0 && height !== 0) {
            canvas.width = width;
            canvas.height = height;
            context.imageSmoothingEnabled = true;
            context.drawImage(sourceCanvas, 0, 0, width, height);
            context.globalCompositeOperation = 'destination-in';
            context.save();
            const ratio = Math.min(width, height) / 2;
            const ratioX = width / 2 / ratio;
            const ratioY = height / 2 / ratio;
            context.scale(ratioX, ratioY);
            context.beginPath();
            context.arc(width / 2 / ratioX, height / 2 / ratioY, ratio, 0, 2 * Math.PI, true);
            context.closePath();
            context.restore();
            context.fill();
        }
        return canvas;
    }

    isCropBtnDisabled() {
        if (this._cropBoxHeight === 0 || this._cropBoxWidth === 0) {
            return true;
        }
        if (!this._cropBoxHeight || !this._cropBoxWidth) {
            return true;
        }

        return false;
    }

}
