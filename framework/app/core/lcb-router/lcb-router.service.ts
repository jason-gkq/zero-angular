import { Injectable, OnDestroy } from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    NavigationExtras,
    ParamMap,
    Router
} from '@angular/router';
import { SessionStorageService } from '@core/cache/session-storage.service';
import { Pagination } from '@core/common/pagination';
import { TitleService } from '@delon/theme';
import { environment } from '@env/environment';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormItemSchema, FormModel } from './../common/form-model';

@Injectable()
export class LcbRouterService implements OnDestroy {
    private history: string[] = [];

    queryParamMap$: Subscription;
    routeData$: Subscription;

    queryParamMap: ParamMap;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleSrv: TitleService,
        private session: SessionStorageService
    ) {
        this.queryParamMap$ = this.activatedRoute.queryParamMap.subscribe(
            paramMap => {
                this.queryParamMap = paramMap;
            }
        );
    }

    getRouter() {
        return this.router;
    }

    getQueryParamMap(): ParamMap {
        return this.queryParamMap;
    }

    setQueryParams(urlParams: Object, model?: FormModel<any>): void {
        let params = {};
        if (model && model instanceof FormModel) {
            Object.keys(urlParams).forEach(key => {
                if (
                    model.schema.get(key) === FormItemSchema.DATE &&
                    urlParams[key]
                ) {
                    params[key] = moment(urlParams[key]).format();
                } else if (
                    model.schema.get(key) === FormItemSchema.DATE_ARRAY &&
                    urlParams[key]
                ) {
                    params[key] = urlParams[key].map(item =>
                        moment(item).format()
                    );
                } else {
                    params[key] = urlParams[key];
                }
            });
        } else {
            params = urlParams;
        }
        // debugger
        this.router.navigate([this.router.url.split('?')[0]], {
            queryParams: params
        });
    }

    goTo(url?: string, extras?: NavigationExtras, param?: number|string) {
        if (!url) {
            this.router.navigateByUrl(environment.defaultHome, extras);
            return;
        }
        // http协议
        if (/^\w+:\/\//.test(url)) {
            location.href = url;
            return;
        }

        // 本系统路由跳转
        if (url.startsWith('/' + environment.appId)) {
            this.router.navigateByUrl(url, extras);
            return;
        }
        // 跨模块跳转
        // let outerUrl = url;
        // const urlSegments = url.split('/');
        // if (urlSegments.length > 4) {
        //     outerUrl = `/${urlSegments[1]}/${urlSegments[2]}/${urlSegments[3]}`;
        // }
        // if (this.session.get('routerRules').indexOf(url) !== -1) {
        // 跨模块跳转不做权限验证，直接跳至对应模块，让本模块进行权限校验
        let queryStr: string;
        if (extras && extras.queryParams) {
            const { queryParams } = extras;
            const queryArr = Object.keys(queryParams).map(key => {
                return `${key}=${queryParams[key]}`;
            });
            queryStr = queryArr.join('&');
        }
        const goUrl = param ? `${url}/${param}` : url;
        location.href = queryStr ? `${environment.HOST}${goUrl}?${queryStr}` : `${environment.HOST}${goUrl}`;
        // return;
        // }

        // this.router.navigateByUrl(environment.defaultHome, extras);
    }

    /**
     * @description  初始化路由历史的监听
     */
    public loadRouting(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(({ urlAfterRedirects }: NavigationEnd) => {
                this.history = [...this.history, urlAfterRedirects];
                this.titleSrv.setTitle();
            });
    }

    /**
     * @description 获取路由历史
     */
    public getHistory(): string[] {
        return this.history;
    }

    /**
     * @description 获取上一次路由路径
     */
    public getPreviousUrl(): string {
        return this.history[this.history.length - 2] || '/index';
    }

    /**
     * @description 根据页面的FormModel转换URL的查询参数
     * @param formModel
     */
    convertQueryParamByModel(formModel: FormModel<any>): any {
        const paramMap = this.getQueryParamMap();
        const { keys } = paramMap;
        const modelValue = {};
        keys.forEach(key => {
            const itemSchema = formModel.schema.get(key);
            switch (itemSchema) {
                case FormItemSchema.NUMBER:
                    modelValue[key] = Number(paramMap.get(key));
                    break;
                case FormItemSchema.NUMBER_ARRAY:
                    modelValue[key] = paramMap
                        .getAll(key)
                        .map(value => Number(value));
                    break;
                case FormItemSchema.DATE:
                    modelValue[key] = moment(paramMap.get(key)).toDate();
                    break;
                case FormItemSchema.DATE_ARRAY:
                    modelValue[key] = paramMap
                        .getAll(key)
                        .map(value => moment(value).toDate());
                    break;
                case FormItemSchema.BOOLEAN:
                    const val = paramMap.get(key);
                    modelValue[key] = val === 'true' || val === '1';
                    break;
                case FormItemSchema.BOOLEAN_ARRAY:
                    modelValue[key] = paramMap
                        .getAll(key)
                        .map(value => value === 'true' || val === '1');
                    break;
                case FormItemSchema.STRING:
                    modelValue[key] = paramMap.get(key);
                    break;
                case FormItemSchema.STRING_ARRAY:
                    modelValue[key] = paramMap.getAll(key);
                    break;
                default:
                    break;
            }
        });

        return modelValue;
    }

    getPagination() {
        const currentPage = this.getQueryParamMap().get('currentPage') || 1;
        const pageSize = this.getQueryParamMap().get('pageSize') || 10;
        const orderBy = this.getQueryParamMap().get('orderBy') || 'id desc';

        return new Pagination(Number(currentPage), Number(pageSize), orderBy);
    }

    ngOnDestroy() {
        // this.queryParamMap$.unsubscribe();
        // this.routeData$.unsubscribe();
        if (this.queryParamMap$) {
            this.queryParamMap$.unsubscribe();
        }
        if (this.routeData$) {
            this.routeData$.unsubscribe();
        }
    }
}
