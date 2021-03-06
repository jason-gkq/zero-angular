import { environment } from '@env/environment';
import * as _ from 'lodash';

class NameStorage {

  store: any;
  private proxy: any;

  constructor(type: string) {
    let ret: any;

    if (window.name) {
      try {
        ret = JSON.parse(window.name);
      } catch (e) {
        ret = {};
      }
    }

    if (!_.isPlainObject(ret)) {
      ret = {};
    }


    if (!ret.session) {
      ret.session = {};
    }

    if (!ret.local) {
      ret.local = {};
    }

    this.proxy.local = ret.local;
    this.proxy.session = ret.session;

    this.store = this.proxy[type];
  }

  getItem(key) {
    return this.store[key];
  }

  setItem(key, value) {
    this.store[key] = value;
    this._saveNameValue();
  }

  removeItem(key) {
    delete this.store[key];
    this._saveNameValue();
  }

  clear() {
    this.store = {};
    this._saveNameValue();
  }

  _saveNameValue() {
    const ret = {
      session: this.proxy.session,
      local: this.proxy.local
    };

    window.name = JSON.stringify(ret);
  }

}

export class AbstractStorageService {

  private hasStorage: any = {
    local: 1,
    session: 1
  };
  private type: string;
  private proxy: any;

  constructor(type: string) {
    this.checkStorage();
    if (this.hasStorage[type]) {
      this.proxy = type === 'local' ? localStorage : sessionStorage;
    } else {
      this.proxy = new NameStorage(type);
    }

    this.type = type;
  }

  private checkStorage() {
    try {
      sessionStorage.setItem('privateTest', '1');
    } catch (e) {
      this.hasStorage.session = 0;
    }

    try {
      localStorage.setItem('privateTest', '1');
    } catch (e) {
      this.hasStorage.local = 0;
    }
  }

  get(key) {
    key = this.getKey(key);
    let value = this.proxy.getItem(key);

    if (value) {
      value = JSON.parse(value);

      if (value) {
        if (value.expires) {
          // 为了安全起见，手机时间改了
          const diff = Date.now() - value.timestamp;

          if (diff > value.expires || diff < 0) {
            // 清除
            this.proxy.removeItem(key);
            return null;
          }
        }
        return value.value;
      } else {
        return null;
      }

    } else {
      return null;
    }
  }

  set(key, value, expires?) {
    key = this.getKey(key);
    const ret: any = {
      value: value
    };

    if (expires) {
      ret.expires = this.setExpires(expires);
      ret.timestamp = Date.now();
    }

    try {
      this.proxy.setItem(key, JSON.stringify(ret));
    } catch (e) {
      if (this.isQuotaExceeded(e)) {
        // Storage full, maybe notify user or do some clean-up
        this.removeHttp();
      }
    }
  }

  remove(key) {
    this.proxy.removeItem(this.getKey(key));
  }

  clear() {
    for (const i of this.getForObject()) {
      if (environment.prefixUnable.indexOf(i) === -1) {
        this.proxy.removeItem(i);
      }
    }
  }

  clearAll() {
    for (const i in this.getForObject()) {
      this.proxy.removeItem(i);
    }
  }

  /**
   * @description
   * 删除ajax缓存
   * @example
   * local.removeHttp('mycar/getMyDefaultCar')
   */
  private removeHttp(url = '') {
    url = environment.prefix + 'http:' + url;
    for (const i in this.getForObject()) {
      if (i.startsWith(url)) {
        this.proxy.removeItem(i);
      }
    }
  }

  private getKey(key) {
    if (environment.prefixUnable.indexOf(key) !== -1) {
      return key;
    }
    return environment.prefix + key;
  }

  private getForObject() {
    return this.proxy instanceof NameStorage ? this.proxy.store : this.proxy;
  }

  private isQuotaExceeded(e): boolean {
    let quotaExceeded = false;
    if (e) {
      if (e.code) {
        switch (e.code) {
          case 22:
            quotaExceeded = true;
            break;
          case 1014:
            // Firefox
            if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              quotaExceeded = true;
            }
            break;
        }
      } else if (e.number === -2147024882) {
        // Internet Explorer 8
        quotaExceeded = true;
      }
    }
    return quotaExceeded;
  }

  private setExpires(time) {
    const str = time + '';
    let count = 0;

    str.replace(/(\d+)([DHMS])/g, function (match: any, $1: any, $2: any): any {
      $1 = parseInt($1, 10);
      switch ($2) {
        case 'D':
          count += $1 * 24 * 3600;
          break;
        case 'H':
          count += $1 * 3600;
          break;
        case 'M':
          count += $1 * 60;
          break;
        case 'S':
          count += $1;
          break;
      }
    });

    time = count ? count : time;

    return time * 1000;
  }

}
