import { Pipe, PipeTransform } from '@angular/core';
import { DictionaryService } from '@core/common/dictionary.service';

@Pipe({ name: 'options' })
export class OptionsPipe implements PipeTransform {

    constructor(private _dictionarySrv: DictionaryService) {

    }
    transform(value: any): any {
        return this._dictionarySrv.getDictionaryValues(value);
    }
}
