import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UbtService } from '@core/ubt/ubt.service';
import { LcbError } from '@core/net/default.interceptor';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private ubt: UbtService) { }

    handleError(error) {
        // 全局异常&js错误捕获，后期优化显示
        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        // throw error;
        if (error instanceof HttpErrorResponse) {
            console.error('HTTP error.', error, 'Status code:', (<HttpErrorResponse>error).status);
        } else if (error instanceof TypeError) {
            this.ubt.saLogger({
                logLevel: 'error',
                logCategory: error.name || '',
                logMsg: 'Type error.' + (error.stack.substring(0, 300) || ''),
            });
            console.error('Type error.', error);
        } else if (error instanceof Error) {
            this.ubt.saLogger({
                logLevel: 'error',
                logCategory: error.name || '',
                logMsg: 'General error.' + (error.stack.substring(0, 300) || ''),
            });
            console.error('General error.', error);
        } else if (error instanceof LcbError) {
            console.error('Lcb error.', error);
        } else {
            let logMsg = 'Nobody threw an Error but something happened!';
            try {
                logMsg = logMsg + (JSON.stringify(error).substring(0, 300) || '');
            } catch (error) { }
            this.ubt.saLogger({
                logLevel: 'error',
                logCategory: 'unknow',
                logMsg: logMsg,
            });
            console.error('Nobody threw an Error but something happened!', error);
        }
    }

}
