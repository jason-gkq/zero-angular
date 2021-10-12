import { environment as config } from './main';
import { environment as environmentExt } from '../../environments/environment.prod';

export const environment = Object.assign(
    config,
    {
        production: true,
        SERVER_URL: 'https://m.lechebang.com/', // 接口api
        HOST: 'https://m.lechebang.com', // 项目域名
        UBT_PROJECT: 'lcbProPC',
        REPOET_URL: 'https://report.lechebang.com/',
        ZF_URL: 'https://zhifu.lechebang.com/',
        ENV: 'prod',
    },
    environmentExt
);
