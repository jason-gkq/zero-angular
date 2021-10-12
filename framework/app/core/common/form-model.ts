import { AbstractControl, FormControl, FormGroup, ValidatorFn, FormArray } from '@angular/forms';


type Model<T> = { [key in keyof T]: {
    value: T[key],
    schema: FormItemSchema,
    validators?: ValidatorFn[]
} };


export class FormModel<T> {

    private _formGroup: FormGroup;
    private _schema: { [key: string]: FormItemSchema };

    get form() {
        return this._formGroup;
    }

    get value(): T {
        const _value = <T>{};
        Object.keys(this.form.value).forEach(
            key => {
                if (Array.isArray(this.form.value[key])) {
                    if (this.form.value[key].length === 0) {
                        _value[key] = null;
                    } else {
                        _value[key] = this.form.value[key];
                    }
                } else {
                    _value[key] = this.form.value[key];
                }
            }
        );
        return _value;
    }

    get schema() {
        const _this = this;
        function get(key: string): FormItemSchema | '' {
            return _this._schema[key] || '';
        }

        return {
            schema: this._schema,
            get
        };
    }

    constructor(model: Model<T>) {
        const controls = this.reduceControls(model);
        this._formGroup = new FormGroup(controls);
        this._schema = this.reduceSchema(model);
    }

    /**
    * @description create FormControls according a object
    * @param controlsConfig T
    */
    private reduceControls(controlsConfig: Model<T>): { [key: string]: AbstractControl } {
        const controls: { [key: string]: AbstractControl } = {};
        Object.keys(controlsConfig).forEach((controlName: string) => {
            controls[controlName] = this.createControl(controlsConfig[controlName]);
        });
        return controls;
    }

    /**
     * @description
     * @param controlConfigItem
     */
    private createControl(controlConfigItem: {
        value: any,
        schema: FormItemSchema,
        validators?: ValidatorFn[]
    }): AbstractControl {
        const { value, validators } = controlConfigItem;
        return validators ? new FormControl(value, validators) : new FormControl(value, validators);
    }

    /**
     * @description
     * @param controlsConfig
     */
    private reduceSchema(controlsConfig: Model<T>): { [key: string]: FormItemSchema } {
        const schema: { [key: string]: FormItemSchema } = {};
        Object.keys(controlsConfig).forEach((controlName: string) => {
            schema[controlName] = controlsConfig[controlName].schema;
        });
        return schema;
    }

    /**
     * @description set Form's value
     * @param val T
     */
    setFormValue(val: T): void {
        this.form.setValue(val);
    }

    /**
     * @description update Form's value
     * @param val any
     */
    updateFormValue(val: any) {
        this.form.patchValue(val);
    }

    /**
     * @description update FormItem's validator
     * @param key string
     * @param validators ValidatorFn
     */
    setFormItemValidator(key: string, validators: ValidatorFn | ValidatorFn[]): void {
        this.form.get(key).setValidators(validators);
    }

    /**
     * @description update Form's validator
     * @param validators { [key: string]: ValidatorFn }
     */
    setFormValidators(validators: { [key: string]: ValidatorFn | ValidatorFn[] }) {
        Object.keys(validators).forEach(controlName => {
            this.setFormItemValidator(controlName, validators[controlName]);
        });
    }

    /**
     * @description set errors to form
     * @param errors
     */
    setErrors(errors: { [key: string]: any } | string) {
        const formGroupErrors = [];
        const errorType = typeof errors;
        if (errorType === 'string') {
            formGroupErrors.push(errors);
        } else {
            Object.keys(errors).forEach(key => {
                const control = this.form.get(key);
                if (control) {
                    let errorMsgs = '';
                    if (errors[key] instanceof Array) {
                        errors[key].forEach((msg, index) => {
                            errorMsgs += `${index + 1}. ${msg} `;
                        });
                    } else {
                        errorMsgs = errors[key];
                    }
                    control.setErrors({
                        customErrors: errorMsgs
                    });
                } else {
                    formGroupErrors.push(errors[key]);
                }
            });
        }

        if (formGroupErrors.length > 0) {
            this.form.setErrors({
                all: formGroupErrors
            });
        }
    }

    /**
     *
     */
    concatControls(...controls: FormControl[]) {
        const values = controls.map(control => control.value);
        const validators = controls.map(control => control.validator).filter(validator => validator !== null);
        return new FormControl(values, validators);
    }

}


/**
 * @description 定义FormItem 值的类型 能覆盖大多数场景 （这里的SCHEMA并不代表组件的类型，只对应值的类型）
 *              文本输入框 - TEXT
 *              数字输入框 - NUMBER
 *              日期选择器 - DATE
 *              多选、级联选择 - ARRAY
 */
export enum FormItemSchema {
    STRING = 'string',
    NUMBER = 'number',
    DATE = 'date',
    BOOLEAN = 'boolean',
    STRING_ARRAY = 'stringArray',
    NUMBER_ARRAY = 'numberArray',
    DATE_ARRAY = 'dateArray',
    BOOLEAN_ARRAY = 'booleanArray'
}
