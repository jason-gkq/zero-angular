import { Pipe, PipeTransform } from '@angular/core';
import { DictionaryService } from '@core/common/dictionary.service';

@Pipe({ name: 'dictionary' })
export class DictionaryPipe implements PipeTransform {
    constructor(private _dictionarySrv: DictionaryService) {

    }
    transform(value: any, moduleName: string): any {
        return this._dictionarySrv.getDictionaryLabel(value, moduleName);
    }
}
