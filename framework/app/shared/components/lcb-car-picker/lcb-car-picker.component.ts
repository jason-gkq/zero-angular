import { Component, OnInit, Input, ViewChild, OnDestroy, OnChanges, SimpleChange } from '@angular/core';
import { NzTreeNodeOptions, NzFormatEmitEvent, NzTreeComponent } from 'ng-zorro-antd/tree';
import { LcbCarPickerService } from './lcb-car-picker.service';
import { Subscription, forkJoin, of, Subject, Observable } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { CarTypeItem } from './lcb-car-picker.model';

@Component({
    selector: 'lcb-car-picker',
    templateUrl: './lcb-car-picker.component.html',
    styleUrls: ['./lcb-car-picker.component.less'],
    providers: [LcbCarPickerService]
})
export class LcbCarPickerComponent implements OnInit, OnDestroy, OnChanges {
    @Input() selectedCarIds: number[] = [];
    // derive: 为衍生工具提供，不支持品牌搜索，不支持selectedCarIds（只用于添加商品车型关联关系）
    @Input() businessOption: { type: string, params: any };
    // 请求参数扩展  type:lcb LCB-32964
    @Input() queryParams: any;
    // 乐车邦五级车型-展示样式扩展（level：number[展示层级，最高为5];singleSelection: boolean[是否是单选，若为true，则只有最后一级开放选项，其余层级禁用，其他勾选需要单独定制]） LCB-32964
    // selectLevel: 该层级可选（一般是最后一层叶子节点）
    @Input() displayConfig: { level?: number; singleSelection?: boolean; selectLevel?: number } = { level: 5, singleSelection: false, selectLevel: 0};

    @ViewChild('carTypeTreeComponent') carTypeTree: NzTreeComponent;

    private carTreeNodes: NzTreeNodeOptions[];

    // 基础数据是否请求成功
    isBaseDataReauestSuccess: boolean;

    private _carSelectedList: { id: number; name: string }[] = [];

    // 已选车型列表
    get carSelectedList(): { id: number; name: string }[] {
        return this._carSelectedList;
    }

    // 已选车型id列表
    get carSelectedIds(): number[] {
        // console.log(this.carSelectedList);
        return this.carSelectedList.map(item => item.id);
    }

    private baseDataInit$$: Subscription;

    // 基础数据是否正在请求
    get isBaseDataInitPending(): boolean {
        return this.baseDataInit$$ && !this.baseDataInit$$.closed;
    }

    private searchValue: string;
    private searchText$ = new Subject<string>();
    carSeries;
    // 是否正在进行搜索请求
    private isSearching: boolean;

    constructor(private carPickerService: LcbCarPickerService) { }

    ngOnInit() {
        this.baseDataInit();
        if (!this.businessOption || this.businessOption.type !== 'derive') {
            this.searchText$.pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(brandTypeName => {
                    if (brandTypeName.length < 2) {
                        if (brandTypeName.length === 0) {
                            this.isSearching = true;
                            return this.carPickerService.getCarBrand({ brandTypeName, ...this.getParams() });
                        } else {
                            return of(brandTypeName);
                        }
                    } else {
                        this.isSearching = true;
                        return this.carPickerService.searchCarSeries({ searchText: brandTypeName, ...this.getParams() });
                    }
                }
                )
            ).subscribe(
                res => {
                    this.isSearching = false;
                    if (res && res['brandList']) {
                        this.carSeries = res;
                        this.formatCarSeriesToTreeNodes();
                    } else {
                        if (typeof(res) !== 'string') {
                            const carBrandList: any = res || [];
                            const treeOptions = this.carPickerService.carTypesToTreeNodeOptions(carBrandList, this.carSelectedIds, this.displayConfig);
                            this.carTreeNodes = treeOptions;
                            // 清除筛选列表
                            this.carSeries = {};
                        }
                    }
                },
                error => {
                    this.isSearching = false;
                    this.carTreeNodes = [];
                }
            );

        }

    }

    formatCarSeriesToTreeNodes() {
        const list = [];
        // 去除父级重复节点,下级节点向上级节点合并数据
        let { brandList, manufacturerList, seriesList } = this.carSeries;
        brandList = Object.assign([], brandList);
        manufacturerList = Object.assign([], manufacturerList);
        seriesList = Object.assign([], seriesList);
        if (manufacturerList && manufacturerList.length > 0) {
            manufacturerList.forEach((brand, index) => {
                const brandIndex = brandList.findIndex(br => br.id === brand.id);
                if (brandIndex !== -1) {
                    brandList[brandIndex] = brand;
                } else {
                    brandList.push(brand);
                }
            });
        }
        if (seriesList && seriesList.length > 0) {
            seriesList.forEach(brand => {
                const brandIndex = brandList.findIndex(br => br.id === brand.id);
                if (brandIndex !== -1) {
                    brand.next.forEach(manufacturer => {
                        const manufacturerIndex = brandList[brandIndex].next.findIndex(ma => ma.id === manufacturer.id);
                        if (manufacturerIndex !== -1) {
                            brandList[brandIndex].next[manufacturerIndex] = manufacturer;
                        } else {
                            brandList[brandIndex] = manufacturer;
                        }
                    });
                } else {
                    brandList.push(brand);
                }
            });
        }
        // 数据转换
        this.carPickerService.carTypesToTreeNodeOptions(brandList, this.carSelectedIds, this.displayConfig).forEach((brand, brandIndex) => {
            const brandChildren = brandList[brandIndex].next;
            if (brandChildren) {
                brand.children = this.carPickerService.carTypesToTreeNodeOptions(brandChildren, this.carSelectedIds, this.displayConfig);
                brand.expanded = true;
                brand.children.forEach((manufacturer, manufacturerIndex) => {
                    const manufacturerChildren = brandList[brandIndex].next[manufacturerIndex].next;
                    if (manufacturerChildren) {
                        manufacturer.children = this.carPickerService.carTypesToTreeNodeOptions(manufacturerChildren, this.carSelectedIds, this.displayConfig);
                        manufacturer.expanded = true;
                    }
                });
            }
            list.push(brand);
        });
        this.carTreeNodes = list;
    }

    getParams() {
        let params;
        switch (this.queryParams ? this.queryParams.type : '') {
            case 'lcb':
                params = this.queryParams;
                break;
            default:
                break;
        }
        return params;
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (const propName in changes) {
            const changedProp = changes[propName];
            if (!changedProp.isFirstChange() && propName === 'selectedCarIds' && changedProp.currentValue) {
                this.clearCarSelectedList();
                this.clearCarTreeNodeChecked();
                this.baseDataInit();
            }
        }
    }

    ngOnDestroy() {
        if (this.searchText$) this.searchText$.unsubscribe();
        if (this.baseDataInit$$) this.baseDataInit$$.unsubscribe();
    }

    getCarSelectedList(carIds: number[]): Observable<{ id: number; name: string }[]> {
        if (carIds.length === 0) {
            return of([]);
        }
        return this.carPickerService.getCarTypesName(this.selectedCarIds);
    }

    getCarBrand(): Observable<CarTypeItem[]> {
        return this.carPickerService.getCarBrand(this.getParams());
    }

    baseDataInit() {
        if (this.baseDataInit$$) this.baseDataInit$$.unsubscribe();
        if (!this.businessOption || this.businessOption.type !== 'derive') {
            this.baseDataInit$$ = forkJoin(
                this.getCarSelectedList(this.selectedCarIds),
                this.getCarBrand()
            ).subscribe(
                resList => {
                    this.isBaseDataReauestSuccess = true;
                    const carSelectedList = resList[0] || [];
                    const carBrandList = resList[1] || [];

                    this._carSelectedList = carSelectedList;
                    const treeOptions = this.carPickerService.carTypesToTreeNodeOptions(carBrandList, this.carSelectedIds, this.displayConfig);
                    this.carTreeNodes = treeOptions;
                },
                error => {
                    this.isBaseDataReauestSuccess = true;
                    this._carSelectedList = [];
                    this.carTreeNodes = [];
                }
            );
        } else {
            this.baseDataInit$$ = this.carPickerService.queryLcbFactory().subscribe(res => {
                this.isBaseDataReauestSuccess = true;
                this.carTreeNodes = this.carPickerService.carTypesToTreeNodeOptionsForDerive(res, [], false);
            },
                error => {
                    this.isBaseDataReauestSuccess = true;
                    this._carSelectedList = [];
                    this.carTreeNodes = [];
                });
        }
    }

    handleTreeExpand(event: NzFormatEmitEvent): void {
        if (!this.businessOption || this.businessOption.type !== 'derive') {
            if (event.node.getChildren().length === 0 && event.node.isExpanded) {
                const carTypeId = +event.node.key;
                this.carPickerService.getChildCarType(carTypeId).subscribe(res => {
                    const carTypeList = res || [];
                    event.node.addChildren(this.carPickerService.carTypesToTreeNodeOptions(carTypeList, this.carSelectedIds, this.displayConfig));
                }, err => {
                    event.node.addChildren([]);
                });
            }
        } else {
            if (event.node.getChildren().length === 0 && event.node.isExpanded) {
                const carTypeId = +event.node.key;
                switch (event.node.level) {
                    // 获取车系
                    case 0:
                        this.carPickerService.queryLcbCarSeriesOption(carTypeId, this.businessOption.params.categoryId).subscribe(res => {
                            const carTypeList = res || [];
                            event.node.addChildren(this.carPickerService.carTypesToTreeNodeOptionsForDerive(carTypeList, this.carSelectedIds, false));
                        }, err => {
                            event.node.addChildren([]);
                        });
                        break;
                    // 获取年款
                    case 1:
                        this.carPickerService.queryLcbYearOption(carTypeId, this.businessOption.params.categoryId).subscribe(res => {
                            const carTypeList = res || [];
                            event.node.addChildren(this.carPickerService.carTypesToTreeNodeOptionsForDerive(carTypeList, this.carSelectedIds, false));
                        }, err => {
                            event.node.addChildren([]);
                        });
                        break;
                    // 获取车型
                    case 2:
                        this.carPickerService.queryAhCarIdOption(carTypeId, this.businessOption.params.categoryId).subscribe(res => {
                            const carTypeList = res || [];
                            event.node.addChildren(this.carPickerService.carTypesToTreeNodeOptionsForDerive(carTypeList, this.carSelectedIds, true));
                        }, err => {
                            event.node.addChildren([]);
                        });
                        break;
                    default:
                        break;
                }

            }
        }

    }

    handleTreeCheckboxChange(event: NzFormatEmitEvent, prop: string): void {
        if (!this.displayConfig.selectLevel && event.eventName === 'click') return;
        const treeNode = event.node;
        if (treeNode[prop]) {
            let checkedName = treeNode.title;
            let node = treeNode;
            while (node.parentNode) {
                try {
                    checkedName = `${node.parentNode.title} ${checkedName}`;
                    node = node.parentNode;
                } catch (error) {
                    console.log(error);
                    break;
                }
            }
            // 衍生工具选中值处理
            if (this.businessOption && this.businessOption.type === 'derive') {
                this.saveCurrentNode(treeNode);
                this.addCarSelected({ id: +treeNode.key, name: checkedName, carLevel: treeNode.origin.carLevel });
            } else {    // 乐车邦车型选中处理
                // 单选处理
                if (this.displayConfig.singleSelection) {
                    if (this._carSelectedList.length === 1) {
                        this.deleteCarSelected(this._carSelectedList[0].id);
                    }
                }
                // 数据返回, 添加path(各层级id)
                this.addCarSelected({ id: +treeNode.key, name: checkedName, path: treeNode.origin.path });
            }
        } else {
            this.deleteCarSelected(+treeNode.key);
        }

    }

    // 同一树枝子父级互斥，同级不斥
    saveCurrentNode(treeNode) {
        let parentNode = treeNode.parentNode;
        while (parentNode) {
            try {
                if (parentNode.isChecked) {
                    this.deleteCarSelected(+parentNode.key);
                }
                parentNode = parentNode.parentNode;
            } catch (error) {
                console.log(error);
                break;
            }
        }
        this.traverse(treeNode);
    }

    // 遍历子节点
    traverse(node) {
        if (node) {
            node.children.forEach(child => {
                if (child.isChecked) {
                    this.deleteCarSelected(+child.key);
                }
                this.traverse(child);
            });
        }
    }

    addCarSelected(data: { id: number; name: string, carLevel?: number, path?: string }) {
        this._carSelectedList.push(data);
    }

    /**
     * 删除选择的车型
     * @param id 车型id
     */
    deleteCarSelected(id: number): void {
        const index = this._carSelectedList.findIndex(data => data.id === id);
        if (index >= 0) {
            this._carSelectedList.splice(this._carSelectedList.findIndex(data => data.id === id), 1);
        }
        this.setCarTypeUnchecked(id);
    }

    /**
     * 取消车型tree中指定车型节点的选中状态
     * @param id 车型id
     */
    setCarTypeUnchecked(id: number) {
        const selectedTreeNodes = this.carTypeTree.nzTreeService.getCheckedNodeList();
        const treeNode = selectedTreeNodes.find(node => (+node.key) === id);
        if (treeNode) {
            treeNode.isChecked = false;
            this.carTypeTree.nzTreeService.setCheckedNodeList(treeNode);
        }
    }

    /**
     * 清空车型树节点选中状态
     */
    clearCarTreeNodeChecked() {
        const selectedTreeNodes = this.carTypeTree.nzTreeService.getCheckedNodeList();
        if (selectedTreeNodes.length > 0) {
            selectedTreeNodes.forEach(treeNode => {
                treeNode.isChecked = false;
                this.carTypeTree.nzTreeService.setCheckedNodeList(treeNode);
            });
        }
    }

    clearCarSelectedList() {
        this._carSelectedList = [];
    }

    handleSearch(value: string) {
        this.searchText$.next(value);
    }

    // 清空搜索
    clearSearch() {
        this.searchValue = '';
        this.handleSearch(this.searchValue);
    }

}
