import { Component, HostListener } from '@angular/core';
import * as screenfull from 'screenfull';

@Component({
    selector: 'header-fullscreen',
    template: `
    <i nz-icon [nzType]="status ? 'fullscreen-exit' : 'fullscreen'" nzTheme="outline"></i>
    {{(status ? 'fullscreen-exit' : 'fullscreen') | translate }}
    `,
    host: {
        '[class.d-block]': 'true'
    }
})
export class HeaderFullScreenComponent {

    status = false;

    @HostListener('window:resize')
    _resize() {
        this.status = screenfull.isFullscreen;
    }

    @HostListener('click')
    _click() {
        if (screenfull.enabled) {
            screenfull.toggle();
        }
    }
}
