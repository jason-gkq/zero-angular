import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import Quill from 'quill';

@Component({
    selector: 'lcb-quill',
    templateUrl: './lcb-quill.component.html',
    styleUrls: ['./lcb-quill.component.less']
})
export class LcbQuillComponent implements OnInit, AfterViewInit {

    editor;
    @Input() options;
    @Input() id;
    host: string;
    token: string;
    @Input()
    set qiniuParams(params) {
        if (params) {
            this.host = params.host;
            this.token = params.token;
        }
    }
    @Input()
    set content(content) {
        this.setContent(content);
    }
    contentInit = true;
    @Output() getContent = new EventEmitter();
    @Input() maxLength;
    @Input() contentHeight = 400;

    constructor(
        private _http: HttpClient,
        private _msgSrv: NzMessageService
    ) { }

    ngOnInit() {

    }

    ngAfterViewInit() {
        if (!this.id) {
            this.id = 'editor';
        }
        this.editor = new Quill(`#${this.id}`, this.options);
        this.editor.on('text-change', (delta, oldDelta, source) => {
            if (this.maxLength && this.editor.getText().length > this.maxLength + 1) {
                this.editor.setContents(oldDelta.ops);
                this.editor.setSelection(this.editor.getText().length, 0);
            }
            this.getContent.emit(this.editor.container.firstChild.innerHTML);
        });
        this.editor.getModule('toolbar').addHandler('image', function (state) {
            if (state) {
                document.getElementById('selectImg').click();
            }
        });
    }

    setContent(content) {
        if (this.editor && this.contentInit) {
            this.editor.container.firstChild.innerHTML = content;
            this.contentInit = false;
        }
    }

    selectedImg(evt) {
        if (!this.host || !this.token) {
            this._msgSrv.error('请传入qiniuParams');
            return;
        }
        const arr = evt.target.files[0].name.split('.');
        const suffix = arr[arr.length - 1];
        const formData = new FormData();
        formData.append('file', evt.target.files[0]);
        formData.append('token', this.token);

        this._http.post(this.host, formData).subscribe(data => {
            let index;
            const range = this.editor.getSelection();
            if (range) {
                index = range.index;
            } else {
                index = this.editor.getLength();
            }
            this.editor.insertEmbed(index, 'image', data['result'].qiniuUrl);
            this.editor.setSelection();
            const file = document.getElementById('selectImg');
            file['value'] = '';
        }, err => {
            console.log('error', JSON.stringify(err));
        });

    }

}
