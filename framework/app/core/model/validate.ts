class RuleValidate {
    // 是否有自定义message信息
    hasMessage = (rule, msgObj) => {
        let message = false;
        if (msgObj) {
            if (msgObj[rule]) {
                message = true;
            }
        }
        return message;
    }

    // 必填字段
    required = (key, requiredVal, obj, msgObj, label) => {
        let desc, result;
        if (obj === undefined || obj == null || obj.length === 0 || (typeof obj === 'string' && obj.trim() === '')) {
            // 有自定义message
            if (this.hasMessage('required', msgObj)) {
                desc = msgObj.required;
            } else {
                desc = `请填写${label}`;
            }
            result = false;
        } else {
            result = true;
        }
        return {
            desc: desc,
            result: result
        };
    }

    // 最小长度
    minLength = (key, minLengthVal, obj, msgObj, label) => {
        let desc, result = false;
        if (obj !== undefined && obj !== null && (obj + '').length < minLengthVal) {
            // 有自定义message
            if (this.hasMessage('minLength', msgObj)) {
                desc = msgObj.minLength;
            } else {
                desc = `${label}小于最小长度`;
            }
            result = false;
        } else {
            result = true;
        }
        return {
            desc: desc,
            result: result
        };
    }

    // 最大长度
    maxLength = (key, maxLengthVal, obj, msgObj, label) => {
        let desc, result = false;
        if (obj !== undefined && obj !== null && (obj + '').length > maxLengthVal) {
            // 有自定义message
            if (this.hasMessage('maxLength', msgObj)) {
                desc = msgObj.maxLength;
            } else {
                desc = `${label}超过最大长度`;
            }
            result = false;
        } else {
            result = true;
        }
        return {
            desc: desc,
            result: result
        };
    }

    // 比较两值是否相等
    equals = (config, key1, key2Val, key1Val, msgObj, label) => {
        let desc, result = false;
        // 对比值相同，但忽略大小写（验证码类）
        if ((config.ignore && config.regulation && (key1Val ? key1Val.toLowerCase() : key1Val) !== (key2Val ? key2Val.toLowerCase() : key2Val))
            // 对比值相同（确认密码类）
            || (!config.ignore && config.regulation && key1Val !== key2Val)
            // 对比值不同（新密码类）
            || (!config.regulation && key2Val === key1Val)) {
            // 有自定义message
            if (this.hasMessage('equals', msgObj)) {
                desc = msgObj.equals;
            } else {
                desc = `${label}值不匹配`;
            }
            result = false;
        } else {
            result = true;
        }
        return {
            desc: desc,
            result: result
        };
    }
}


export class Validate {
    ruleArr = ['required', 'maxLength', 'minLength', 'equals'];

    addMethod = function (rule, message, func) {
        this[`${rule}Message`] = message;
        this[`${rule}Func`] = func;
        this[`${rule}Name`] = rule;
        this[rule] = function (key, value, msgObj) {
            let desc, result = false;
            const ruleValidate = new RuleValidate();
            if (!this[`${rule}Func`](value)) {
                if (ruleValidate.hasMessage(this[`${rule}Name`], msgObj)) {
                    desc = msgObj[this[`${rule}Name`]];
                } else {
                    desc = this[this[`${rule}Name`] + 'Message'] ? this[this[`${rule}Name`] + 'Message'] : '该值验证不通过';
                }
                result = false;
            } else {
                result = true;
            }
            const result1 = {
                desc: desc,
                result: result
            };
            return result1;
        };
    };

    // 结构变动的validate
    validate = (ruleArr) => {
        const result = {};
        const ruleValidate = new RuleValidate();

        ruleArr.forEach((item) => {
            const target = item.target;
            // 增加自定义方法
            if (item.methods) {
                item.methods.forEach(method => {
                    // 已有该自定义验证方法
                    if (!this[method.rule]) {
                        this.addMethod(method.rule, method.message, method.func);
                    }
                });
            }
            result[item.key] = [];

            for (const ruleKey in item.rules) {
                if (this.ruleArr.indexOf(ruleKey) !== -1) {
                    if (ruleKey === 'equals') {
                        result[item.key].push(ruleValidate[ruleKey](item.rules[ruleKey], item.key, target[item.rules[ruleKey].attr], item.value, item.messages, item.label));
                    } else {
                        result[item.key].push(ruleValidate[ruleKey](item.key, item.rules[ruleKey], item.value, item.messages, item.label));
                    }
                } else {
                    result[item.key].push(this[ruleKey](item.key, item.value, item.messages));
                }
            }
        });
        const newResult = this.recombileResult(result);
        return newResult;
    }

    recombileResult = function (result) {
        const newResult = {};
        for (const key in result) {
            if (result[key].length > 0) {
                newResult[key] = [];
                result[key].forEach(item => {
                    if (!item.result) {
                        newResult[key].push(item.desc);
                    }
                });
            }
        }
        return newResult;
    };
}
