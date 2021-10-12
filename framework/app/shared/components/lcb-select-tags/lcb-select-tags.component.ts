import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'lcb-select-tags',
    templateUrl: './lcb-select-tags.component.html',
    styleUrls: ['./lcb-select-tags.component.less'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: LcbSelectTagsComponent,
        multi: true
    }]
})
export class LcbSelectTagsComponent implements ControlValueAccessor {
    listOfOption = [];
    listOfTagOptions = [];
    isVisible: boolean;
    inputValue: any;
    @Input() maxTagCount: number;
    @Input() size = 'default';
    @Input() placeholder = '请输入';
    onChangeListener: any; // 改变值回调
    onTouchedListener: any; // 交互回调
    constructor() { }

    writeValue(obj: any) {
        this.listOfTagOptions = obj || [];
    }

    registerOnChange(fn: any): void {
        this.onChangeListener = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedListener = fn;
    }

    openModel() {
        this.inputValue = this.listOfTagOptions.join('\n');
        this.isVisible = true;
    }

    handleOk() {
        if (this.inputValue) {
            this.listOfTagOptions = this.inputValue.split(/\n/).filter(item => item.trim() !== '');
        } else {
            this.listOfTagOptions = [];
        }
        this.onChangeListener(this.listOfTagOptions);
        this.onTouchedListener();
        this.isVisible = false;
    }

    tagsChange() {
        this.onChangeListener(this.listOfTagOptions);
        this.onTouchedListener();
    }

}
