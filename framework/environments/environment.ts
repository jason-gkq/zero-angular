// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { environment as config } from './main';
import { environment as environmentExt } from '../../environments/environment';

export const environment = Object.assign(
    config,
    {
        SERVER_URL: 'http://m.lcbint.cn/', // 接口api
        HOST: 'http://m.lcbint.cn', // 项目域名
        UBT_PROJECT: 'lcb_test2',
        REPOET_URL: 'https://report.lechebang.cn/',
        ZF_URL: 'https://zf.lechebangstatic.com/',
        ENV: 'local',
    },
    environmentExt
);
