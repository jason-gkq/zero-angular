/**
 * Created by WebStorm.
 * User: guokeqin
 * Date: 2018/01/23
 * Time: 10:00
 */
import * as _ from 'lodash';
import {Validate} from './validate';

/**
 * Class: 数据层基础类
 * 基础定义：
 * 衍生类中定义自己属性值
 * 衍生类attributeLabels 和对应的属性保持一致
 * validationErrors 验证错误信息数组
 * attributes 衍生类中属性及值的集合
 * attributeLabels 定义属性以及属性名称，必须继承覆盖
 * rules 定义属性值的验证规则，如有规则则继承覆盖
 */
export class Model {

    /**
     * model 中字段错误
     * {
   *  id: ['error 1', 'error 2']
   * }
     * @type {{}}
     */
    validationErrors = {};
    validateFlag = true;
    private _attributes = {};

    constructor() {
        const self = this;
        /**
         * 基类不能被实例化
         */
        if (new.target === Model) {
            throw new Error('本类不能实例化');
        }

        /**
         * 根据集成类定义的标签自动生成get方法，使当前类有该属性
         * @type {{}}
         */
        const columns = self.attributeLabels();

        if (!_.isEmpty(columns)) {
            for (const [key, value] of Object.entries(columns)) {
                self._attributes[key] = '';
                const obj = {
                    ['_' + key]: '',
                    get [key]() {
                        return this['_' + key];
                    },
                    set [key](val) {
                        this['_' + key] = val;
                    }
                };
                Object.assign(self, obj);
            }
        }
        const validate = new Validate();
        const rules = self.rules();
        // console.log('getOwnPropertyNames: ', Object.getOwnPropertyNames(self));
        /**
         * 代理重写get和set方法，用于强类型转行和赋值验证
         */
        if (window['Proxy']) {
            return new Proxy(self, {
                /**
                 * Method: 重写 get 方法，在 object.{column} 时候触发
                 * @param {this} target 当前类实例化的对象
                 * @param {PropertyKey} propertyKey 字段名
                 * @param receiver
                 * @returns {any}
                 */
                get: function (target, propertyKey: PropertyKey, receiver?: any) {
                    return Reflect.get(target, propertyKey, receiver);
                },

                /**
                 * Method: 重写 set 方法，在 object.{column} = value 时候触发
                 * @param {object} target 当前类实例化的对象
                 * @param {PropertyKey} propertyKey 字段名
                 * @param value 对应的值
                 * @param receiver
                 * @returns {boolean}
                 */
                set: function (target: object, propertyKey: PropertyKey, value: any, receiver?: any) {
                    self.clearErrors(propertyKey);
                    if (!self.validateFlag) {
                        return Reflect.set(target, propertyKey, value, receiver);
                    }
                    if (_.isEmpty(rules) || !rules[propertyKey]) {
                        return Reflect.set(target, propertyKey, value, receiver);
                    }
                    const columnRules = rules[propertyKey];
                    if (_.isEmpty(columnRules) || !columnRules['rules']) {
                        return Reflect.set(target, propertyKey, value, receiver);
                    }
                    const columnError = validate.validate([Object.assign({
                        key: propertyKey,
                        value: value,
                        label: self.getAttributeLabel(propertyKey),
                        target: target
                    }, columnRules)]);
                    self.addErrors(columnError);
                    const columnRule = columnRules['rules'];
                    if (columnRule['type']) {
                        value = self.checkColumnType(propertyKey, value, columnRule['type']);
                    }
                    return Reflect.set(target, propertyKey, value, receiver);
                }
            });
        }
    }

    /**
     * Method: 定义属性名称
     * {
   *    key: 'label'
   * }
     * @returns {{}}
     */
    protected attributeLabels() {
        return {};
    }

    /**
     * Method: 验证规则定义
     * {
   *  rules: { // required | maxLength | minLength | function
   *    column: {
   *      required: true | false,
   *      maxLength: number,
   *      minLength: number
   *    }
   *  },
   *  message: {
   *    column: {
   *      required: 'required error message',
   *      maxLength: 'max length error message',
   *      minLength: 'min length error message'
   *    }
   *  },
   *  method: [
   *    {
   *      rule: 'function',
   *      message: 'error message',
   *      func: function (value) {
   *        return boolean;
   *      }
   *    }
   *  ]
   * }
     * @returns {{}}
     */
    protected rules() {
        return {};
    }

    /**
     * Method: 获取标签对应名称
     * @param {string} attribute
     * @returns {string}
     */
    getAttributeLabel(attribute): string {
        const labels = this.attributeLabels();
        if (attribute in labels) {
            return labels[attribute];
        } else {
            return _.startCase(attribute);
        }
    }

    /**
     * Method: 添加错误信息
     * @param {string} attribute
     * @param {string} message
     */
    addError(attribute: string, message: string): void {
        if (attribute in this.validationErrors) {
            if (_.isArray(this.validationErrors[attribute])) {
                if (_.indexOf(this.validationErrors[attribute], message) < 0) {
                    this.validationErrors[attribute].push(message);
                }
            } else {
                this.validationErrors[attribute] = [message];
            }
        } else {
            Object.assign(this.validationErrors, {[attribute]: [message]});
        }
    }

    /**
     * Method: 添加错误信息
     * @param {object} errors
     * {
   *  id: 'id error',
   *  title: ['title error 1', 'title error 2']
   * }
     */
    addErrors(errors: object): void {
        if (_.isObject(errors) && !_.isEmpty(errors)) {
            for (const [key, value] of Object.entries(errors)) {
                if (_.isEmpty(value)) {
                    continue;
                }
                if (_.isArray(value)) {
                    for (const k of value) {
                        this.addError(key, k);
                    }
                } else {
                    this.addError(key, value);
                }
            }
        }
    }


    /**
     * Method: 清除错误信息
     * @param {string} attribute
     */
    clearErrors(attribute = null): void {
        if (attribute === null) {
            this.validationErrors = {};
        } else {
            delete this.validationErrors[attribute];
        }
    }

    /**
     * Method: 判断是否有验证不通过的错误信息
     * @returns {boolean}
     */
    hasErrors(): boolean {
        return !_.isEmpty(this.validationErrors);
    }

    /**
     * Method: 数据整体验证
     * @returns {boolean}
     */
    validate(): boolean {
        const self = this;
        const rules = this.rules();
        const validateRules = [];
        for (const [key, value] of Object.entries(rules)) {
            validateRules.push(Object.assign({
                key: key,
                value: self[key],
                label: self.getAttributeLabel(key),
                target: this
            }, value));
        }
        const validate = new Validate();
        const columnErrors = validate.validate(validateRules);
        self.clearErrors();
        self.addErrors(columnErrors);
        return !self.hasErrors();
    }

    /**
     * Method: attributes 魔术方法
     * @returns {object}
     */
    get attributes(): object {
        const self = this;
        for (const [key, value] of Object.entries(self._attributes)) {
            self._attributes[key] = self[key];
        }
        return self._attributes;
    }

    /**
     * Method: attributes 魔术方法
     * @param object
     */
    set attributes(object) {
        const self = this;
        const tmpAll = Object.assign(self._attributes, object);
        for (const [key, value] of Object.entries(tmpAll)) {
            self[key] = value;
            if (self._attributes[key]) {
                self._attributes[key] = key;
            }
        }
    }

    /**
     * Method: 数据类型验证及转换
     * @param attribute
     * @param value
     * @param {string} columnType
     * @returns {any}
     */
    private checkColumnType(attribute, value: any, columnType: string) {
        let tmpValue = value;
        if (columnType === 'Number') {
            tmpValue = Number(value);
            if (_.isNaN(tmpValue)) {
                this.addError(attribute, '格式错误，该字段必须为数字');
                tmpValue = value;
            }
        } else if (columnType === 'String') {
            tmpValue = String(value);
            if (tmpValue === '[object Object]') {
                this.addError(attribute, '格式错误，该字段必须为字符串');
                tmpValue = value;
            }
        } else if (columnType === 'Boolean') {
            tmpValue = Boolean(value);
        } else if (columnType === 'Array') {
            if (!_.isArray(tmpValue)) {
                this.addError(attribute, '格式错误，该字段必须为数组');
            }
        } else if (columnType === 'Object') {
            if (!_.isObject(tmpValue)) {
                this.addError(attribute, '格式错误，该字段必须为对象');
            }
        }
        return tmpValue;
    }

}
