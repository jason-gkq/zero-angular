import { Pagination } from './pagination';

export default interface ICustomListRequest {
    page?: { [key in keyof Pagination] };
}
