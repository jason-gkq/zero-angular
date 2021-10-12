import { Directive, forwardRef, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
@Directive({
    selector: `[validateEqual]`,
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => EqualValidatorDirective),
            multi: true
        }
    ]
})

export class EqualValidatorDirective implements Validator {
    _anotherStr;
    @Input()
    set anotherStr(anotherStr) {
        this._anotherStr = anotherStr ? anotherStr : '';
    }

    @Input() ignoreCase;

    constructor() {
    }
    validate(c: AbstractControl): { [key: string]: any } {
        const v = c.value ? c.value : '';
        let equal;
        if (this.ignoreCase) {
            equal = v.toUpperCase().trim() !== this._anotherStr.toUpperCase().trim();
        } else {
            equal = v.trim() !== this._anotherStr.trim();
        }
        if (equal) {
            return { validateEqual: {invalid: true} };
        }
        return null;
    }
}

