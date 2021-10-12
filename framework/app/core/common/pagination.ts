export class Pagination {
    currentPage: number = 1;
    pageSize: number = 10;
    totalCount: number = 0;
    pageSizeOptions: number[] = [10, 20, 50];
    orderBy: string = 'id desc';

    get currentPageRange() {
        const start = this.pageSize * (this.currentPage - 1) + 1;
        const end = this.pageSize * this.currentPage > this.totalCount ? this.totalCount : this.pageSize * this.currentPage;
        return {
            range: [start, end],
            desc: `【第 ${start}-${end} 条, 共 ${this.totalCount} 条】`
        };
    }

    constructor(currentPage: number, pageSize: number, orderBy: string) {
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.orderBy = orderBy;
    }

    update({ currentPage, pageSize, orderBy, totalCount }: { [key: string]: any }) {
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.orderBy = orderBy;
        this.totalCount = totalCount;
    }

    reset() {
        this.currentPage = 1;
        this.totalCount = 0;
        this.pageSize = 10;
        this.orderBy = 'id desc';
    }
}
