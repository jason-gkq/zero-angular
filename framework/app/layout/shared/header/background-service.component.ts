import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { UtilsService } from '@core/utils/utils.service';
import * as sha1 from 'js-sha1';
import * as _ from 'lodash';
import { UserService } from '@core/user/user.service';
import { SettingsService } from '@delon/theme';

declare var window: any;

@Component({
    selector: 'background-service',
    template: `
        <div class="hand" (click)="targetUdesk()">
            在线客服 <i nz-icon nzType="phone" nzTheme="outline"></i>
        </div>
        <div class="call-wrap" *ngIf="settings.layout.isUdesk" (click)="targetUdesk()">
            <i nz-icon nzType="customer-service" nzTheme="outline" class="icon"></i>
        </div>
    `,
    styles: [`
        .hand {
            cursor: pointer;
        }
        .call-wrap{
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #1690FF;
            box-shadow: 0 2px 20px 0 rgba(22,144,255,0.50);
            position: fixed;
            bottom: 40%;
            right: 20px;
            cursor: pointer;
            z-index: 2;
        }
        .call-wrap .icon{
            position: absolute;
            top: 50%;
            left: 50%;
            font-size: 25px;
            color: #fff;
            transform: translate(-50%,-50%);
        }
    `]
})
export class HeaderBackgroundServiceComponent implements OnInit, AfterViewInit {

    flag = false;
    initFlag = true;

    constructor(private user: UserService,
        private utils: UtilsService,
        private auth: AuthService,
        public settings: SettingsService) {
    }

    targetUdesk() {
        if (this.initFlag) {
            this.initUdesk();
            this.initFlag = false;
        }
        if (this.flag) {
            window.ud.hidePanel();
            this.flag = false;
        } else {
            window.ud.showPanel();
            this.flag = true;
        }
    }

    ngOnInit() {
        const a = document.querySelector('.udesk-call');
        a['style'].position = 'fiexd';
    }

    initUdesk(): void {
        const nonce = this.utils.guid();
        const timestamp = Date.now();
        const signStr = sha1(`nonce=${nonce}&timestamp=${timestamp}&web_token=${this.user.currentUser.user.mobile}&e2777b08bd5a8a1002eb3c6569125e96`);
        const currentGroupInfo = this.auth.currentGroupInfo;
        const roles = currentGroupInfo.roles;
        let rolesStr = '';
        roles.forEach(item => {
            rolesStr = rolesStr + item.roleName + '；';
        });
        const customer = {
            nonce: nonce,
            signature: _.toUpper(signStr),
            web_token: this.user.currentUser.user.mobile,
            timestamp: timestamp,
            c_org: `${currentGroupInfo.groupId}：${currentGroupInfo.groupName}`,
            c_name: this.user.currentUser.userInfo.nickName,
            c_desc: rolesStr,
            c_phone: this.user.currentUser.user.mobile
        };
        console.log('udeskCustomer：', customer);
        window.ud('init');
        window.ud({
            // 商品信息暂不传
            // product: {
            //     title: '测试商品',
            //     url: '',
            //     image: 'https://ocpuvny5s.qnssl.com/mkt_activity/activity_ad/20180412/b73e6600-db03-4ddb-8ec2-fde422a5367a.png',
            //     '价格': '￥6189.00',
            //     '促销价': '￥6188.00'
            // },
            customer: customer
        });
        // if (this.isUdesk) {
        //     window.ud('init');
        //     window.ud({
        //         // 商品信息暂不传
        //         // product: {
        //         //     title: '测试商品',
        //         //     url: '',
        //         //     image: 'https://ocpuvny5s.qnssl.com/mkt_activity/activity_ad/20180412/b73e6600-db03-4ddb-8ec2-fde422a5367a.png',
        //         //     '价格': '￥6189.00',
        //         //     '促销价': '￥6188.00'
        //         // },
        //         customer: customer
        //     });
        // }
    }

    ngAfterViewInit(): void {
        //     const nonce = this.utils.guid();
        //     const timestamp = Date.now();
        //     const signStr = sha1(`nonce=${nonce}&timestamp=${timestamp}&web_token=${this.user.currentUser.user.mobile}&e2777b08bd5a8a1002eb3c6569125e96`);
        //     const currentGroupInfo = this.auth.currentGroupInfo;
        //     const roles = currentGroupInfo.roles;
        //     let rolesStr = '';
        //     roles.forEach(item => {
        //         rolesStr = rolesStr + item.roleName + '；';
        //     });
        //     const customer = {
        //         nonce: nonce,
        //         signature: _.toUpper(signStr),
        //         web_token: this.user.currentUser.user.mobile,
        //         timestamp: timestamp,
        //         c_org: `${currentGroupInfo.groupId}：${currentGroupInfo.groupName}`,
        //         c_name: this.user.currentUser.userInfo.nickName,
        //         c_desc: rolesStr,
        //         c_phone: this.user.currentUser.user.mobile
        //     };
        //     console.log('udeskCustomer：', customer);
        //     if (this.isUdesk) {
        //         window.ud('init');
        //         window.ud({
        //             // 商品信息暂不传
        //             // product: {
        //             //     title: '测试商品',
        //             //     url: '',
        //             //     image: 'https://ocpuvny5s.qnssl.com/mkt_activity/activity_ad/20180412/b73e6600-db03-4ddb-8ec2-fde422a5367a.png',
        //             //     '价格': '￥6189.00',
        //             //     '促销价': '￥6188.00'
        //             // },
        //             customer: customer
        //         });
        //     }
    }
}
