/**
 * optList配置项
 */
export class ItemModel {
    name: string;           // 操作名称
    hidden?: boolean;       // 隐藏：true；显示：false
    url?: Array<string>;    // 跳转url地址,[url,extras]
    event?: string;         // 操作事件的名称，接收@Output acEvtOption参数写相应的操作逻辑
    target?: string;        // 路由跳转时是否另开窗口 新开: _blank；不开：其余
    auth?: string;          // 操作权限
    icon?: string;          // 图标
    isModuleUrl?: boolean;  // 是否为本模块跳转url，只有url有效时该参数才会被启用
}

/**
 * lcb-option input options model
 */
export class OptionModel {
    showCount?: number;          // 显示操作的个数，其余以[更多]+下拉形式显示
    optList: Array<ItemModel>;   // 操作组
    isIcon?: boolean;           // 是否以图标形式展示
}


