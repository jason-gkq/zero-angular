import { Directive, Input, ElementRef, OnInit, HostListener, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';

@Directive({
    selector: '[hoverShow]'
})
export class HoverShowDirective implements OnInit, OnChanges {

    @Input()
    hoverShow: boolean;

    @HostListener('mouseover') onMouseOver() {
        this.isHovering = true;
        this.show();
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.isHovering = false;
        if (this.hoverShow) {
            this.hidden();
        }
    }

    isHovering: boolean;

    constructor(private el: ElementRef<HTMLElement>) { }

    ngOnInit() {
        //this.el.nativeElement.classList.add('hover-show');
    }

    ngOnChanges(changes: SimpleChanges) {
        const { hoverShow } = changes;
        if (!hoverShow.currentValue) {
            this.show();
        } else {
            this.isHovering ? this.show() : this.hidden();
        }
    }

    show() {
        this.el.nativeElement.classList.remove('hover-show');
    }

    hidden() {
        this.el.nativeElement.classList.add('hover-show');
    }

}
