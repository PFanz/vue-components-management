# Vue 组件库

基础的Vue组件仓库，用于维护组件源码

> build base [vue-cli v3.x](https://cli.vuejs.org/zh/)
> packages manage by [lerna](https://github.com/lerna/lerna#readme)

## 功能

### 创建

`npm run pkg-new <package name>`

- package name 检查
- 根据`scripts/template`下模板创建新组件模板
- 根据`eslint`配置格式化初始文件
- 添加到预览开发的导航中

### 开发

`npm run serve`

- 提供预览开发的导航
- `Vue cli`的`vue-cli-service serve`功能，详见[Vue cli](https://cli.vuejs.org/zh/guide/cli-service.html#vue-cli-service-serve)

### 构建

`npm run pkg-build [package name]`

- 构建所有/指定组件
- 支持组件目录下自定义构建，或根目录下通用构建配置文件
- `Vue cli`的`vue-cli-service build`功能，详见[Vue cli](https://cli.vuejs.org/zh/guide/cli-service.html#vue-cli-service-build)

### 删除

`npm run pkg-del <package name>`

- 删除组件及二次确认

### 发布组件

`npm run publish`

- 执行`lerna publish`，详见[lerna](https://github.com/lerna/lerna)
- 需先执行`git commit`，`lerna`会检查有变动的包，并发布`git`和`npm`

## 其他

### 约定

1.package name 命名需要加`-vue`尾缀

2.发布会用`namespace`作为包前缀`@namespace/`，可以修改`template`中代码进行修改

### 说明

搭建时，对`lerna`的学习不够，该项目应该可以全部使用`lerna`来实现。
