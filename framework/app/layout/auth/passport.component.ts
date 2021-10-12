import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
    selector: 'layout-passport',
    templateUrl: './passport.component.html',
    styleUrls: ['./passport.component.less']
})
export class LayoutAuthComponent implements OnInit {
    fDate = ((new Date()).getFullYear());
    env = environment;

    constructor(
    ) {
    }

    ngOnInit() {

    }
}
