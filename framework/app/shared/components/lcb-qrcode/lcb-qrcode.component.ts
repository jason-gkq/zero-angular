import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { OptionModel } from './lcb-qrcode-options.model';

declare var QRCode: any;

@Component({
    selector: 'lcb-qrcode',
    templateUrl: './lcb-qrcode.component.html'
})
export class LcbQrcodeComponent implements OnInit, OnChanges {

    qrcode;

    @Input() url: string;
    // _options: OptionModel;
    @Input() options: OptionModel;

    constructor() { }

    ngOnInit() {
        this.qrcode = new QRCode(document.getElementById('qrcode'), this.options);
        this.qrcode.clear();
        if (this.url.length > 0) {
            this.qrcode.makeCode(this.url);
        }
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (const propName in changes) {
            const changedProp = changes[propName];
            if (!changedProp.isFirstChange() && propName === 'url' && changedProp.currentValue) {
                this.qrcode.clear();
                this.qrcode.makeCode(changedProp.currentValue);
            }
        }
    }

}
