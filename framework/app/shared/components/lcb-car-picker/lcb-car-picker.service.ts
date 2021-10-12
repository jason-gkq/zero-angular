import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CarTypeItem } from './lcb-car-picker.model';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class LcbCarPickerService {

    constructor(private http: HttpClient) { }

    /**
     * 搜索三级车型信息
     * @param params
     */
    searchCarSeries(params) {
        return this.http.post('gateway/manage/common/api/carBrandType/searchCarSeries', params);
    }

    /**
    * 获取所有品牌（一级车型）
    */
    getCarBrand(params?: { brandIcon?: boolean; brandTypeName?: string; full?: boolean; }) {
        return this.http.post<CarTypeItem[]>(`gateway/manage/common/api/carBrandType/queryCarBrandInfo`, params);
    }

    /**
     * 根据上级车型查下级车型
     * @param parentId 上级车型id
     * @param orderBy 排序方式
     */
    getChildCarType(parentId: number, orderBy?: string) {
        return this.http.post<CarTypeItem[]>(`gateway/manage/common/api/carBrandType/queryChildCarBrandType`, {
            parentId,
            orderBy
        });
    }

    /**
     * 根据车型id查询车型名称
     * @param carTypeIds
     * @param space
     */
    getCarTypesName(carTypeIds: number[], space?: string): Observable<{ id: number; name: string }[]> {
        return this.http.post<{ [key: number]: string }>(`gateway/manage/common/api/carBrandType/queryBrandTypeFullName`, {
            brandTypeIds: carTypeIds,
            space: space || ' '
        }).pipe(
            map(res => {
                const ids = Object.keys(res);
                return ids.map(id => {
                    return {
                        id: +id,
                        name: res[id]
                    };
                });
            })
        );
    }

    /**
     * 将车型数据转换为treeOption数据格式
     * @param carType 车型数据
     * @param selectedIds 已选择的车型id
     * @param displayConfig 展示样式
     */
    carTypesToTreeNodeOptions(carTypes: CarTypeItem[], selectedIds?: number[], displayConfig?: { level?: number; singleSelection?: boolean; selectLevel?: number }): NzTreeNodeOptions[] {
        if (carTypes.length === 0) {
            return [];
        }
        return carTypes.map(carType => {
            const { id, name, level, path } = carType;
            return {
                key: `${id}`,
                title: name,
                selectable: displayConfig.selectLevel ? level === displayConfig.selectLevel ? true : false : false,
                checked: selectedIds ? selectedIds.includes(id) : false,
                isLeaf: level && level === displayConfig.level,
                path
            };
        });
    }

    /***********************************衍生工具四级车型（厂商-车系-年款-车型（汽车之家））************************************/
    /**
     * 获取lcb厂商
     */
    queryLcbFactory(): Observable<any> {
        return this.http.post('gateway/manage/store/global/brandType/queryLcbFactory', {});
    }

    /**
     * 根据厂商获取可选装lcb车系
     * @param parentId 上级节点id
     * @param categoryId 商品类目id
     */
    queryLcbCarSeriesOption(parentId, categoryId): Observable<any> {
        return this.http.post('gateway/manage/store/global/brandType/queryLcbCarSeriesOption', {
            parentId: parentId,
            categoryId: categoryId
        });
    }

    /**
     * 根据车系获取可选装lcb年款
     * @param parentId 上级节点id
     * @param categoryId 商品类目id
     */
    queryLcbYearOption(parentId, categoryId): Observable<any> {
        return this.http.post('gateway/manage/store/global/brandType/queryLcbYearOption', {
            parentId: parentId,
            categoryId: categoryId
        });
    }

    /**
     * 根据年款获取汽车之家车型(会返回是否可装)
     * @param parentId 上级节点id
     * @param categoryId 商品类目id
     */
    queryAhCarIdOption(parentId, categoryId): Observable<any> {
        return this.http.post('gateway/manage/store/global/brandType/queryAhCarIdOption', {
            parentId: parentId,
            categoryId: categoryId
        });
    }

    /**
     * 对车型数据转换为treeOption
     * @param carTypes 车型数据
     * @param selectedIds 当前选中数据
     * @param isLeaf 是否是叶子节点
     */
    carTypesToTreeNodeOptionsForDerive(carTypes, selectedIds?: number[], isLeaf?: boolean): NzTreeNodeOptions[] {
        if (carTypes.length === 0) {
            return [];
        }
        return carTypes.map(carType => {
            return {
                key: carType.carBrandTypeId,
                title: carType.carBrandTypeName,
                optionValue: carType.optionValue,
                parentId: carType.parentId,
                selectable: false,
                disabled: carType.optionValue === 0 || carType.optionValue === 2,
                checked: selectedIds ? selectedIds.includes(carType.carBrandTypeId) : false,
                isLeaf: isLeaf,
                carLevel: carType.carLevel
            };
        });
    }

}
