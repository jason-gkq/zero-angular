export interface App {
  name?: string;
  description?: string;
  year?: number;
  [key: string]: any;
}

export interface User {
  name?: string;
  avatar?: string;
  email?: string;
  [key: string]: any;
}

export interface Layout {
  /** 是否固定顶部菜单 */
  fixed: boolean;
  /** 是否折叠右边菜单 */
  collapsed: boolean;
  /** 是否固定宽度 */
  boxed: boolean;

  sidebarUser: boolean; // 菜单上方用户信息
  headerSearch: boolean; // 是否有搜索
  headerNotify: boolean; // 是否有消息
  headerSetting: boolean; // 是否可设置
  isHeaderUdesk: boolean; // 是否展示页面头部Udesk
  storeSwitch: boolean; // 是否展示切换店铺
  isUdesk: boolean; // 页面中部udesk
  headerHelpCenter: boolean; // 帮助中心
  /** 语言环境 */
  lang: string;
  /** 当前主题 */
  theme: string;
  [key: string]: any;
}
