import { DOCUMENT } from '@angular/common';
import { Component, ContentChild, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { toBoolean } from '@delon/util';

const CLS = 'ad-footer-toolbar';

@Component({
  selector: 'footer-toolbar',
  template: `
  <div class="left"><ng-container *ngIf="extra" [ngTemplateOutlet]="extra"></ng-container></div>
  <div class="right">
    <ng-content></ng-content>
  </div>
  `,
  preserveWhitespaces: false,
})
export class FooterToolbarComponent implements OnInit, OnDestroy {
  @Input()
  get errorCollect() {
    return this._errorCollect;
  }
  set errorCollect(value: any) {
    this._errorCollect = toBoolean(value);
  }
  private _errorCollect = false;

  @ContentChild('extra') extra: TemplateRef<any>;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private doc: any,
  ) { }

  ngOnInit() {
    (this.el.nativeElement as HTMLElement).classList.add(CLS);
    this.renderer.addClass(this.el.nativeElement, CLS);
    this.doc.querySelector('body').classList.add(`has-${CLS}`);
  }

  ngOnDestroy() {
    this.doc.querySelector('body').classList.remove(`has-${CLS}`);
  }
}
