import { environment as config } from "./main";
import { environment as environmentExt } from "../../environments/environment.dev";

export const environment = Object.assign(
    config,
    {
        SERVER_URL: "https://m.lechebang.com.cn/", // 接口api
        HOST: "https://m.lechebang.com.cn", // 项目域名
        UBT_PROJECT: "lcb_test2",
        REPOET_URL: "https://report.lechebang.cn/",
        ZF_URL: "https://zf.lechebangstatic.com/",
        ENV: "test",
    },
    environmentExt
);
