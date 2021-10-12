// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { environment as config } from './main';
import { environment as environmentExt } from '../../environments/environment';

export const environment = Object.assign(
    config,
    {
        SERVER_URL: 'http://m.lechebang.cn/', // 接口api
        HOST: 'http://m.lechebang.cn', // 项目域名
        UBT_PROJECT: 'lcb_test2',
        REPOET_URL: 'https://report.lechebang.cn/',
        ZF_URL: 'https://zf.lechebangstatic.com/',
        hmr: true,
        ENV: 'local',
    },
    environmentExt
);
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
