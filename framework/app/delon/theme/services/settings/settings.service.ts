import { Injectable } from '@angular/core';
import { App, Layout, User } from './interface';

// const LAYOUT_KEY = 'layout';
// const USER_KEY = 'user';
// const APP_KEY = 'app';

@Injectable()
export class SettingsService {
  private _app: App = null;
  private _user: User = null;
  private _layout: Layout = null;

  // private get(key: string) {
  //   return JSON.parse(localStorage.getItem(key) || 'null') || null;
  // }

  // private set(key: string, value: any) {
  //   localStorage.setItem(key, JSON.stringify(value));
  // }

  get layout(): Layout {
    if (!this._layout) {
      this._layout = Object.assign(
        <Layout>{
          fixed: true,
          collapsed: false,
          boxed: false,
          lang: null,
          sidebarUser: false,
          headerSearch: false,
          headerNotify: false,
          headerSetting: false,
          isHeaderUdesk: false,
          storeSwitch: false,
          isUdesk: false,
          headerHelpCenter: false,
        }
      );
    }
    return this._layout;
  }

  get app(): App {
    if (!this._app) {
      this._app = Object.assign(
        <App>{
          year: new Date().getFullYear(),
        }
      );
    }
    return this._app;
  }

  get user(): User {
    if (!this._user) {
      this._user = Object.assign(<User>{});
    }
    return this._user;
  }

  setLayout(name: string, value: any): boolean {
    // if (typeof this.layout[name] !== 'undefined') {
    try {
      this.layout[name] = value;
      return true;
    } catch (error) {
      return false;
    }
    // }
    // return false;
  }

  setApp(val: App) {
    this._app = val;
  }

  setUser(val: User) {
    this._user = val;
  }
}
