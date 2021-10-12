import { Model } from './model';

export class SearchModel extends Model {


    currentPage: number;  // 当前页码
    pageSize: number;     // 每页条数
    totalCount: number; // 总数
    pageSizeOptions: number[] = [10, 20, 50];
    range: number[] = [];
    orderBy = 'id desc';
    pageDesc: string = '';
    constructor() {
        super();
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalCount = 0;
    }


    /**
     * Method: 定义input框类型
     * type: text/number/textarea/singleSelect/multipleSelect/dateTimePicker
     * {
   *    key: 'value'
   * }
     * @returns {{}}
     */
    protected inputTypes() {
        return {};
    }


    /**
     * Method: 获取input框类型
     * @param {string} type
     * @returns {string}
     */
    getInputTypes(type): string {
        const types = this.inputTypes();
        if (type in types) {
            return types[type];
        } else {
            return;
        }
    }


    /**
     * Method:重新组装请求参数数据结构：把同级的currentPage和pageSize组装进新字段page中
     * @param {obj} urlObj
     * @returns {obj}
     */
    getQueryObj(urlObj) {
        const queryObj = {};
        for (const key in urlObj) {
            if (key !== 'currentPage' && key !== 'pageSize' && typeof urlObj[key] !== 'function' && key.indexOf('_') === -1) {
                queryObj[key] = urlObj[key];
            } else {
                queryObj['page'] = {
                    currentPage: parseInt(urlObj['currentPage'], 10),
                    pageSize: urlObj['pageSize']
                };
            }
        }
        return queryObj;
    }

    getPagination() {
        return {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalCount: this.totalCount,
            range: this.range,
            orderBy: this.orderBy,
            pageDesc: this.pageDesc
        };
    }

    setPagination(pageInfo: any) {

        if (!pageInfo) {
            return;
        }
        const { currentPage, pageSize, totalCount } = pageInfo;
        this.currentPage = Number(currentPage);
        this.pageSize = Number(pageSize);
        this.totalCount = Number(totalCount);
        const start = this.pageSize * (this.currentPage - 1) + 1;
        const end = this.pageSize * this.currentPage > this.totalCount ? this.totalCount : this.pageSize * this.currentPage;
        this.range = [start, end];
        this.pageDesc = `【第 ${start}-${end} 条, 共 ${this.totalCount} 条】`;
    }

    reset() {
        Object.keys(this.attributes).forEach((key) => {
            this[key] = null;
        });
    }

    update(extend) {
        Object.keys(extend).forEach(key => {
            this[key] = extend[key];
        });
    }

    parseToObject(extend?) {
        return Object.assign({}, this.attributes, { page: this.getPagination() });
    }

}
