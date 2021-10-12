import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from '../cache/local-storage.service';


@Injectable()
export class DictionaryService implements OnDestroy {

    private static EXPIRES = 86400;

    private dictionary: { [key: string]: any[] } = {};

    private dict$: BehaviorSubject<string>;
    private pipe$: BehaviorSubject<string>;

    private dict$$: Subscription;

    constructor(private httpClient: HttpClient,
        private local: LocalStorageService) {
        this.dict$ = new BehaviorSubject(null);
        this.pipe$ = new BehaviorSubject('');

        this.dict$$ = this.dict$.subscribe(code => {
            if (code) {
                this.getItems([code]).subscribe(res => {
                    this.dictionary[code] = res[code];
                    this.pipe$.next(code);
                });
            }
        });
    }

    ngOnDestroy() {
        this.dict$$.unsubscribe();
    }

    /**
     * @description 转化具体值为数据字典字面量
     * @param value
     * @param key
     */
    getDictionaryLabel(value: any, key: string): Observable<string> {
        if (!this.dictionary[key]) {
            this.dictionary[key] = [];
            this.dict$.next(key);
        }

        return this.pipe$.map(() => {

            if (this.dictionary[key] && this.dictionary[key].length > 0) {
                const result = this.dictionary[key].find(item => String(item.value) === String(value));
                return result !== undefined ? result['name'] : '';
            } else {
                return '';
            }

        });
    }

    /**
     * 获取某一个数据字典的所有值
     * @param key
     */
    getDictionaryValues(key: string): Observable<any[]> {
        if (!this.dictionary[key]) {
            this.dictionary[key] = [];
            this.dict$.next(key);
        }

        return this.pipe$.map(() => {
            if (this.dictionary[key].length > 0) {
                return this.dictionary[key];
            } else {
                return [];
            }

        });
    }

    /**
     * 获取数据字典
     */
    getItems(codes: Array<string>): Observable<any> {
        if (codes.length <= 0) {
            return Observable.create(observer => {
                observer.next([]);
                observer.complete();
            });
        }

        const result = {};
        const request = [];
        codes.forEach(code => {
            const tmp = this.local.get('dictionary.' + code);
            if (tmp) {
                result[code] = tmp;
            } else {
                request.push(code);
            }
        });

        if (request.length > 0) {
            return this.httpClient.post('gateway/manage/common/api/dictionary/queryDictionaryByCodes', {
                codeList: request
            }).map(data => {
                Object.keys(data).forEach(code => {
                    result[code] = data[code];
                    this.local.set('dictionary.' + code, data[code], DictionaryService.EXPIRES);
                });
                return result;
            });
        }
        return Observable.create(observer => {
            observer.next(result);
            observer.complete();
        });
    }

    /**
     * 根据数据字典列表和值获取对应名称
     */
    getItemName(items: Array<any>, value): Observable<string> {
        return Observable.create(observer => {
            let name = '';
            if (items && items.length > 0) {
                const obj = items.find(item => String(item.value) === String(value));
                name = obj ? obj.name : '';
            }
            observer.next(name);
            observer.complete();
        });
    }

    /**
     * 获取appCode列表
     */
    getAppCode(): Observable<any> {
        const appCodeList = this.local.get('dictionary.appCode');
        if (!appCodeList) {
            return this.httpClient.post('gateway/saas/ext/comm/appCode/getAll', {}).map(data => {
                this.local.set('dictionary.appCode', data, DictionaryService.EXPIRES);
                return data;
            });
        }
        return Observable.create(observer => {
            observer.next(appCodeList);
            observer.complete();
        });
    }

    /**
     * 获取服务商列表
     * businessType:1集采供应商，2零采服务商
     * isOpen:0关闭，1开启
     */
    getSupplier(businessType: Number, isOpen: Number): Observable<any> {
        const tmpKey = `dictionary.supplier.${businessType}.${isOpen}`;
        const supplierList = this.local.get(tmpKey);
        if (!supplierList) {
            return this.httpClient.post<Array<any>>('gateway/saas/ext/comm/supplier/getList', { businessType: businessType, isOpen: isOpen })
                .map(data => {
                    const tmp = [];
                    data.forEach(item => {
                        tmp.push({
                            name: item.supplierName,
                            value: item.id
                        });
                    });
                    this.local.set(tmpKey, tmp, DictionaryService.EXPIRES);
                    return tmp;
                });
        }
        return Observable.create(observer => {
            observer.next(supplierList);
            observer.complete();
        });
    }

    /**
     * 获取以开放城市列表
     */
    getOpenedCity(): Observable<any> {
        const placeList = this.local.get('dictionary.openedCity');
        if (!placeList) {
            return this.httpClient.post('gateway/saas/ext/comm/place/getOpenCity', {}).map(data => {
                this.local.set('dictionary.openedCity', data, DictionaryService.EXPIRES);
                return data;
            });
        }
        return Observable.create(observer => {
            observer.next(placeList);
            observer.complete();
        });
    }

    getStoreFullName(groupType): Observable<string> {
        let groupName;
        switch (groupType) {
            case 1:
                groupName = '集团';
                break;
            case 2:
                groupName = '店铺';
                break;
            case 5:
                groupName = '服务商';
                break;
            case 6:
                groupName = '门店';
                break;
            case 7:
                groupName = '总部';
                break;
            case 8:
                groupName = '厂商';
                break;
            default:
                groupName = '';
        }
        return Observable.create(observer => {
            observer.next(groupName);
            observer.complete();
        });
    }

    getCarServiceItems(): Observable<any> {
        const key: string = 'dictionary.carServiceItems';
        const carItems = this.local.get(key);
        if (!carItems) {
            return this.httpClient.post('gateway/saas/ext/comm/car/getCarServiceItems', {}).map(data => {
                this.local.set(key, data, DictionaryService.EXPIRES);
                return data;
            });
        }
        return Observable.create(observer => {
            observer.next(carItems);
            observer.complete();
        });
    }
}
