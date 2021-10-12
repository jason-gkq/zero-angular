export interface CarTypeItem {
    id: number;
    parentId: number;
    name: string;
    level: number;
    status?: number;
    brandProduct?: number;
    attachmentId?: number;
    brandImgUrl?: string;
    brandPinyin?: string;
    saleStatus?: number;
    isToMtn?: number;
    deleted?: number;
    [key: string]: any;
}
