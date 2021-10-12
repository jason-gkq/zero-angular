import { environment as environmentExt } from '../../environments/main';

export const environment = Object.assign(
    {
        production: false,
        SERVER_URL: `./`,
        HOST: '',
        hmr: false,
        appCode: 202, // 项目code
        appId: 'ng', // 项目唯一标识
        prefix: 'ng_', // 缓存前缀
        appName: '乐车邦',
        defaultHome: '/ng/home', // 项目首页
        prefixUnable: ['sid', 'token'], // 无前缀缓存
        theme: 'A', // 布局格式
        dictionaryCodes: [],
        notificationPeriod: 1800000,
        ENV: 'local',
        manufacturer: 'lcb',
        layout: { // 仅本地开发使用
            sidebarUser: false, // 菜单上方用户信息
            headerSearch: false, // 是否有搜索
            headerNotify: false, // 是否有消息
            headerSetting: false, // 是否可设置
            isHeaderUdesk: false, // 是否展示页面头部Udesk
            storeSwitch: false, // 是否展示切换店铺
            isUdesk: false, // 页面中部udesk
            headerHelpCenter: false, // 帮助中心
        },
    },
    environmentExt
);
