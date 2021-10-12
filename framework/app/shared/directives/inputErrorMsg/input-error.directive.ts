import {Directive, TemplateRef, ViewContainerRef, Input, ElementRef} from '@angular/core';

@Directive({
    selector: '[lcbInputError]'
})

export class InputErrorDirective {

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private elementRef: ElementRef,
    ) {

    }

    errorNode: any;

    /**
     * 有class='input-error'节点的，红框属性加在该节点上，没有默认绑定在指令所在的节点上。
     * 注：指令节点必须有一个不与其他指令共用的父节点，且设置input-error必须为该父节点的子孙节点
     * @param errorMsg
     */
    @Input() set lcbInputError(errorMsg) {

        if (!this.elementRef.nativeElement.nextElementSibling) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (errorMsg && errorMsg.length > 0) {
            const el = this.getEl();
            el['style'].border = 'darkred 1px solid';
            let errorText = '';
            errorMsg.forEach((item, index) => {
                if (errorMsg.length === 1) {
                    errorText = item;
                } else {
                    errorText += `${index + 1}.${item} `;
                }
            });
            const textNode = document.createTextNode(errorText);
            // 创建错误节点
            if (!this.errorNode) {
                this.errorNode = document.createElement('div');
                this.errorNode.appendChild(textNode);
                this.errorNode.style.color = 'darkred';
                this.errorNode.style.clear = 'both';
                el.parentNode.appendChild(this.errorNode);
            } else {
                // 展示错误节点
                this.errorNode.innerHTML = errorText;
                this.errorNode.style.display = 'block';
            }
        } else {
            // 隐藏错误节点
            if (this.errorNode) {
                const el = this.getEl();
                el['style'].border = '#DDE6E9 1px solid';
                this.errorNode.style.display = 'none';
            }
        }
    }

    getEl() {
        let el;
        if (this.elementRef.nativeElement.nextElementSibling.querySelector('.input-error')) {
            el = this.elementRef.nativeElement.nextElementSibling.querySelector('.input-error');
        } else {
            el = this.elementRef.nativeElement.nextElementSibling;
        }
        return el;
    }

}
