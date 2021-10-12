import { DictionaryService } from '@core/common/dictionary.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'localDictionary'
})
export class LocalDictionaryPipe implements PipeTransform {
    constructor(
        private _dictionarySrv: DictionaryService
    ) { }

    transform(value: any, args?: any): any {
        return this._dictionarySrv.getItemName(args, value);
    }

}
