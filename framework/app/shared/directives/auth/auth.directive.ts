import { Router, RouterLink, ActivatedRoute, Route } from '@angular/router';
import { Directive, ElementRef, Input, Renderer2, Attribute } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import {environment} from '../../../../environments/environment';

@Directive({
  selector: '[lcbAuth]'
})
export class AuthDirective {

  private _auth: string;

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    private render: Renderer2,
    private el: ElementRef,
    private authService: AuthService,
  ) {
  }

  @Input('lcbAuth')
  set auth(value: string) {
    this._auth = value;
    this.check(this._auth);
  }

  private check(value: string) {
    const el = this.el.nativeElement;

    if (!this.authService.check(value)) {
      this.render.setStyle(el, 'display', 'none');
    }
  }

}
