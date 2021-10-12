import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StartupService } from '@core/startup/startup.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService} from 'ng-zorro-antd/message';
import { LcbRouterService } from '@core/lcb-router/lcb-router.service';
import { SessionStorageService } from '@core/cache/session-storage.service';
import { Observable } from 'rxjs/Rx';
import { map, takeWhile } from 'rxjs/internal/operators';
import { environment } from '@env/environment';
import { UtilsService } from '@core/utils/utils.service';

@Component({
    selector: 'passport-forgetPwd',
    templateUrl: './forgetPwd.component.html',
    styleUrls: ['./forgetPwd.component.less']
})
export class AuthForgetPwdComponent implements OnInit, OnDestroy {

    form: FormGroup;
    loading = false;
    codeType = 'primary';
    codeDisabled = false;
    codeDesc = '发送验证码';
    interval$;
    code$;
    // securityCode;
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
        private utils: UtilsService
    ) {
        modalSrv.closeAll();
    }

    // region: fields

    get mobile() { return this.form.controls.mobile; }
    get password() { return this.form.controls.password; }
    get confirmPassword() { return this.form.controls.confirmPassword; }
    get captchaCode() { return this.form.controls.captchaCode; }
    get code() { return this.form.controls.code; }

    pwdVisible = false;
    confirmPwdVisible = false;

    ngOnInit() {
        this.form = this.fb.group({
            password: [null, [Validators.required, Validators.pattern(/((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))(?!^.*[\u4E00-\u9FA5].*$)^\S{8,16}$/)]],
            confirmPassword: [null, Validators.required],
            mobile: [null, [Validators.required, Validators.pattern(/^1\d{10}$/)]],
            captchaCode: [null, [Validators.required]],
            code: [null, [Validators.required]]
        });
    }

    getCode(securityContent) {
        this.mobile.markAsDirty();
        this.mobile.updateValueAndValidity();
        if (this.mobile.invalid) return;
        this.http.post('gateway/manage/common/api/user/sendSecurityFindPwdSms', {
            mobile: this.form.value.mobile,
            captchaToken: this.captchaToken,
            captchaCode: this.form.value.captchaCode,
            url: location.href
        }).subscribe(data => {
            this.changeCodeBtn();
        }, (err) => {
            if (err.statusCode === '9135' || err.statusCode === '9136') {
                this.imgSrc = `${environment.SERVER_URL}gateway/captcha/${err.result}`;
                this.captchaToken = err.result;
                this.modalSrv.create({
                    nzTitle: '图片验证码',
                    nzContent: securityContent,
                    nzWidth: 400,
                    nzOnOk: () => {
                        this.captchaCode.markAsDirty();
                        this.captchaCode.updateValueAndValidity();
                        if (this.captchaCode.invalid) return false;
                        this.getCode(securityContent);
                    }
                });
            }

        });
    }

    getCaptchaToken() {
        this.http.post('gateway/manage/common/api/user/getCaptchaToken', {
            mobile: this.form.value.mobile,
            msgType: 0
        }).subscribe(data => {
            this.captchaToken = data;
            this.imgSrc = `${environment.SERVER_URL}gateway/captcha/${data}`;
        });
    }

    changeCodeBtn() {
        if (this.code$) this.code$.unsubscribe();
        this.codeType = 'default';
        this.codeDisabled = true;
        this.code$ = Observable.interval(1000).pipe(
            map(num => 59 - num),
            takeWhile(num => num >= 0)
        ).subscribe((num) => {
            this.codeDesc = `发送中（${num}）`;
            if (num === 0) {
                this.codeType = 'primary';
                this.codeDisabled = false;
                this.codeDesc = '重发验证码';
            }
        });
    }

    // endregion

    submit() {
        this.mobile.markAsDirty();
        this.mobile.updateValueAndValidity();
        this.password.markAsDirty();
        this.password.updateValueAndValidity();
        this.confirmPassword.markAsDirty();
        this.confirmPassword.updateValueAndValidity();
        this.code.markAsDirty();
        this.code.updateValueAndValidity();
        if (this.mobile.invalid || this.password.invalid || this.confirmPassword.invalid || this.code.invalid) return;
        // mock http
        this.loading = true;
        this.http.post(`gateway/manage/common/api/user/resetPwd`, this.form.value).subscribe(
            data => {
                this.msg.success('密码修改成功,您将跳转登录页');
                setTimeout(() => {
                    location.href = `${environment.HOST}/user/login`;
                }, 3000);
            },
            error => {
                this.loading = false;
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
                    this.form.setErrors({
                        all: ['重置密码失败']
                    });
                }
            },
            () => {
                this.loading = false;
            }
        );
    }



    ngOnDestroy(): void {
        if (this.interval$) clearInterval(this.interval$);
        if (this.code$) this.code$.unsubscribe();
    }
}
