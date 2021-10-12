import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuService } from '@delon/theme';
import { SessionStorageService } from '../cache/session-storage.service';

@Injectable()
export class LcbMenuService {

    private static KEY_MENUS = 'menus';

    constructor(private httpClient: HttpClient,
        private menuService: MenuService,
        private session: SessionStorageService) {
    }

    setMenu() {
        const self = this;
        self.httpClient
            .post<Array<any>>('gateway/manage/common/api/menu/queryUserMenus', {})
            .subscribe(data => {
                self.session.set(LcbMenuService.KEY_MENUS, data);
                self.menuService.clear();
                self.menuService.add(data);

            });
    }

}
