### 项目介绍
新建项目流程：
  1. 新建项目文件夹，打开文件夹
  1. 从[git](http://git.lcbint.cn/angular/h5-framework-ng)上获取最新`init.js`和`init.json`文件放置到项目目录下
  1. 执行 `node init.js --env=[local|test|prod]`，初始化项目


项目初始化：    
> `node init.js --env=[local|test|prod]`

本地开发：
  - **参数详解**
  - --port 指定启动端口
  - --host 指定启动域名；默认是：localhost
  - -o 是否自动用默认浏览器打开

如果指定域名启动，则需要添加本地host映射
> `ng serve --host=local.lechebang.cn --port=4201`

打包介绍
  - **打包参数详解**
  - --environment prod 使用environment.prod.ts 文件的环境变量   
  - --aot 启用前期编译。这是目前版本的Angular CLI的默认设置。如果你使用低版本，必须手动启用它   
  - --extract-css true 将所有的CSS提取到独立的样式表文件中    
  - --sourcemaps false 禁用压缩文件对应map的生成    
  - --named-chunks false 禁用使用人类可读名称的块和使用数字   
  - --build-optimizer 新功能，导致更小的捆绑，但更长的构建时间，所以谨慎使用！（也应该在未来默认启用）    
  - --vendor-chunk 将所有第三方依赖（库）代码提取到单独的块中
  - max-old-space-size 临时调整node占用内存大小 

测试环境打包：    
>  `ng build --configuration=test --extraWebpackConfig webpack.extra.js`

生产环境打包：
>  `ng build --prod --extraWebpackConfig webpack.extra.js`

打包机生产打包：
>  `node --max-old-space-size=10240 ./node_modules/@angular/cli/bin/ng build --prod --extraWebpackConfig webpack.extra.js`


### 版本介绍：    
  1.7.0：
  1. 升级angular框架版本

  1.8.0（打包和之前版本差异大，环境变量差异大，可认为向前不兼容）   
  1. 更新测试环境打包合并，不在区分1、2、3、4，统一为一个测试包
  1. 更新堡垒生产打包，堡垒生产打同一个包
  1. 更新GET请求时不做处理直接发起请求
  1. 删除对开发环境打包支持
  1. 添加根据域名初始化环境变量功能
