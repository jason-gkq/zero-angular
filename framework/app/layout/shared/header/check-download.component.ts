import { Component } from '@angular/core';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { environment } from '@env/environment';

@Component({
    selector: 'check-download',
    template: `
        <div class="hand" (click)="goToDownloadCenter()">
            下载中心  <i nz-icon nzType="download" nzTheme="outline"></i>
        </div>
    `,
    styles: [`
        .hand {
            cursor: pointer;
        }
    `]
})

export class HeaderCheckDownloadComponent {
    env = environment;

    constructor(
        private routerService: LcbRouterService
    ) {

    }

    goToDownloadCenter() {
        // 区别supplier
        if (this.env['downloadUrl']) {
            window.open(`${this.env.HOST}${this.env['downloadUrl']}`, '_blank');
        } else {
            window.open(`${this.env.HOST}/common/workBench/download`, '_blank');
        }
    }

}
