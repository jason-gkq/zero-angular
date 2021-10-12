import { UtilsService } from '@core/utils/utils.service';
import { CookieService } from '@core/cache/cookie.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '@core/cache/local-storage.service';
import { SessionStorageService } from '@core/cache/session-storage.service';
import { StartupService } from '@core/startup/startup.service';
import { UserService } from '@core/user/user.service';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { environment } from '@env/environment';
import { Observable, Subscription } from 'rxjs/Rx';
import { map, takeWhile } from 'rxjs/internal/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
@Component({
    selector: 'passport-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})
export class AuthLoginComponent implements OnInit, OnDestroy {

    form: FormGroup;
    loading = false;
    count = 0;
    interval$: any;
    showCode = 0;
    securityCode;
    refresh;
    pwdVisible = false;
    whichTab = 'pwd'; //默认密码登录
    appCode = environment.appCode || ''; //拿到项目appCode
    codeDisabled = false;
    codeDesc = '获取验证码';
    code$: Subscription;
    captchaToken;
    imgSrc;
    constructor(
        private fb: FormBuilder,
        public msg: NzMessageService,
        private modalSrv: NzModalService,
        private startupSrv: StartupService,
        private http: HttpClient,
        private session: SessionStorageService,
        private routerService: LcbRouterService,
        private localSrv: LocalStorageService,
        private cookieSrv: CookieService,
        private utils: UtilsService
    ) {
        modalSrv.closeAll();
    }

    // region: fields

    get loginName() { return this.form.controls.loginName; }
    get passwd() { return this.form.controls.passwd; }
    get captcha() { return this.form.controls.captcha; }
    get captchaCode() { return this.form.controls.captchaCode; }
    get code() { return this.form.controls.code; }
    get mobile() { return this.form.controls.mobile; }
    get smsCaptchaCode() { return this.form.controls.smsCaptchaCode; }

    // endregion

    // region: get captcha

    ngOnInit() {
        this.form = this.fb.group({
            passwd: [null, Validators.required],
            loginName: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
            captcha: [null, [Validators.required]],
            captchaCode: [null, [Validators.required]],
            mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
            code: [null, [Validators.required]],
            smsCaptchaCode: [null, [Validators.required]],
        });
    }

    setSecurityCode(securityCode) {
        setTimeout(() => {
            this.securityCode = securityCode;
        });
    }
    //获取验证码
    getCode(securityContent) {
        environment['handleError'] = true;
        this.mobile.markAsDirty();
        this.mobile.updateValueAndValidity();
        if (this.mobile.invalid) return;
        this.http.post('gateway/user/sendSecurityLoginSms', {
            mobile: this.form.value.mobile ? this.form.value.mobile.trim() : null,
            captchaToken: this.captchaToken ? this.captchaToken.trim() : null,
            captchaCode: this.form.value.smsCaptchaCode ? this.form.value.smsCaptchaCode.trim() : null,
        }).subscribe(data => {
            this.changeCodeBtn();
        }, (err) => {
            if (err.statusCode === '9135' || err.statusCode === '9136') {
                this.form.patchValue({
                    smsCaptchaCode: ''
                });
                this.imgSrc = `${environment.SERVER_URL}gateway/captcha/${err.result}`;
                this.captchaToken = err.result;
                this.modalSrv.create({
                    nzTitle: '图片验证码',
                    nzContent: securityContent,
                    nzWidth: 400,
                    nzOnOk: () => {
                        this.smsCaptchaCode.markAsDirty();
                        this.smsCaptchaCode.updateValueAndValidity();
                        if (this.smsCaptchaCode.invalid) return false;
                        this.getCode(securityContent);
                    }
                });
            }

        },
            () => {
                environment['handleError'] = false;
            });
    }

    getCaptchaToken() {
        environment['handleError'] = true;
        this.http.post('gateway/user/sendSecurityLoginSms', {
            mobile: this.form.value.mobile ? this.form.value.mobile.trim() : null,
            captchaToken: this.captchaToken ? this.captchaToken.trim() : null,
            captchaCode: '',
        }).subscribe(data => {
            this.captchaToken = data;
            this.imgSrc = `${environment.SERVER_URL}gateway/captcha/${data}`;
        }, err => {
            this.captchaToken = err.result;
            this.imgSrc = `${environment.SERVER_URL}gateway/captcha/${err.result}`;
        },
            () => {
                environment['handleError'] = false;
            });
    }

    changeCodeBtn() {
        if (this.code$) this.code$.unsubscribe();
        this.codeDisabled = true;
        this.code$ = Observable.interval(1000).pipe(
            map(num => 59 - num),
            takeWhile(num => num >= 0)
        ).subscribe((num) => {
            this.codeDesc = `发送中（${num}）`;
            if (num === 0) {
                this.codeDisabled = false;
                this.codeDesc = '重发验证码';
            }
        });
    }
    // endregion

    submit() {
        if (this.showCode > 3) {
            this.captchaCode.markAsDirty();
            this.captchaCode.updateValueAndValidity();
        }

        if (this.whichTab === 'pwd') {
            this.loginName.markAsDirty();
            this.loginName.updateValueAndValidity();
            this.passwd.markAsDirty();
            this.passwd.updateValueAndValidity();
        }
        if (this.whichTab === 'sms') {
            this.mobile.markAsDirty();
            this.mobile.updateValueAndValidity();
            this.code.markAsDirty();
            this.code.updateValueAndValidity();
        }

        if (this.showCode > 3 && this.whichTab === 'pwd') {
            if (this.loginName.invalid || this.passwd.invalid || this.captchaCode.invalid) return;
        }
        if (this.showCode < 3 && this.whichTab === 'pwd') {
            if (this.loginName.invalid || this.passwd.invalid) return;
        }
        if (this.whichTab === 'sms') {
            if (this.mobile.invalid || this.code.invalid) return;
        }
        // mock http
        this.localSrv.clearAll();
        this.session.clearAll();
        this.loading = true;
        if (this.whichTab === 'pwd') {
            this.loginResolve(`gateway/manage/common/api/user/pwdLogin`, { ...this.form.value, mobile: null, code: null, tokenType: 2 });
        }
        if (this.whichTab === 'sms') {
            this.loginResolve(`gateway/manage/common/api/user/smsLogin`, { ...this.form.value, loginName: null, passwd: null });
        }

    }
    //登录
    loginResolve(api: string, valueObj: any) {
        this.http.post(api, valueObj).subscribe(
            data => {
                this.loading = false;
                // 更新currentUser
                if (data && data['token']) {
                    this.utils.setCookieDomains('token', data['token']);
                    // this.cookieSrv.setItem('token', data['token'], Infinity, '/', this.cookieSrv.getDomain());
                    // if (environment.production) {
                    //     this.cookieSrv.setItem('token', data['token'], Infinity, '/', '.lechebang.com');
                    //     this.cookieSrv.setItem('token', data['token'], Infinity, '/', '.edndc.com');
                    // } else {
                    //     this.cookieSrv.setItem('token', data['token'], Infinity, '/', this.cookieSrv.getDomain());
                    //     this.cookieSrv.setItem('token', data['token'], Infinity, '/', '.lechebang.cn');
                    //     this.cookieSrv.setItem('token', data['token'], Infinity, '/', '.edndc.cn');
                    // }
                }
                this.session.set(UserService.KEY_CURRENT_USER, data);
                // 重新获取 StartupService 内容，若其包括 User 有关的信息的话
                this.startupSrv.load().then((res) => {
                    if (res) {
                        if (res.statusCode) {
                            this.msg.error(res.msg);
                        } else {
                            this.routerService.goTo();
                        }
                    } else {
                        this.msg.error('登录失败，请重试');
                    }
                });
            },
            error => {
                this.loading = false;
                if (this.whichTab === 'pwd') {
                    this.showCode++;
                    if (this.showCode > 4) {
                        this.refresh = !this.refresh;
                    }
                }
                const keys = Object.keys(this.form.controls);
                const all = [];
                if (error['validationErrors'] && typeof error['validationErrors'] === 'object') {
                    for (const key in error['validationErrors']) {
                        const value = error['validationErrors'][key];
                        if (keys.indexOf(key) >= 0) {
                            this.form.controls[key].setErrors({
                                [key]: value
                            });
                        } else {
                            all.push(value);
                        }
                    }
                    if (all.length > 0) {
                        this.form.setErrors({
                            all: all
                        });
                    }
                } else {
                    const message = error && error.msg ? error.msg : '登录失败';
                    this.form.setErrors({
                        all: [message]
                    });
                }
            });
    }
    tabSelectChange() {
        this.form.setErrors({});
    }
    ngOnDestroy(): void {
        if (this.interval$) clearInterval(this.interval$);
        if (this.code$) {
            this.code$.unsubscribe();
        }
    }
}
