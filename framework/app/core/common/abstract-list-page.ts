import { LcbRouterService } from './../lcb-router/lcb-router.service';
import { OnInit } from '@angular/core';
import { Pagination } from './pagination';

export abstract class AbstractListPage {

    pagination: Pagination = new Pagination(1, 10, 'id desc');

    constructor(protected lcbRouter: LcbRouterService) {
    }

    /**
     * @description 获取列表页的数据
     */
    abstract getListData(): void;
}
