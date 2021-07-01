# vue-ts-template
1.基于vue-cli创建的 ts 项目模板，包含mixin、vuex、axios，封装微信授权、分享等函数，处理了IOS设备底部安全区域问题、fixed元素错位问题。  
2.添加了 postcss 预处理器，定义了一些css基础样式、变量等。  
3.将原有的封装常用方法的 `.js`文件改写为 `.ts` 文件。

## 项目安装
```
npm install
```
### 快速创建页面
```
npm run create [filename|directory/filename]
```
### 删除页面
```
npm run delete [filename|directory/filename]
```

### 开发环境编译及热更新
```
npm run serve
```

### 生产环境编译及文件压缩
```
npm run build
```

### 启动单元测试
```
npm run test:unit
```

### 启动端到端测试
```
npm run test:e2e
```

### 启动eslint校验及自动修复
```
npm run lint
```

### 自定义配置
See [Configuration Reference](https://cli.vuejs.org/config/).

### 备注
1. 项目使用了postcss 8.x.x 版本，会有以下问题：
* 无法使用 postcss-mixins 插件。postcss-mixins 插件没有更新到 postcss 8.x.x。[issue](https://github.com/postcss/postcss/wiki/PostCSS-8-for-end-users)  
* 样式混入，可用 [postcss-apply](https://www.npmjs.com/package/postcss-apply)  代替。
* postcss-import@14.x.x 会报错。回退到 12.x.x 可以正常运行。[issue](https://github.com/postcss/postcss-import/issues/435)
2. `.css`文件报错后，可能导致编译出问题，无法再实时编译css文件。重新保存一下vue文件可恢复正常。
3. typescript：
* eslint校验中，函数参数不允许指定为any类型，否则，会提示 `warning  Argument 'XXX' should be typed with a non-any type  @typescript-eslint/explicit-module-boundary-types`。 解决方案：[explicit-module-boundary-types.md](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-module-boundary-types.md)
* computed property的函数返回值必需指定类型，否则，会提示 `Property 'XXX' does not exist on type 'CombinedVueInstance<Vue, unknown, unknown, unknown, Readonly<Record<never, any>>>'.Vetur(2339)`。 [Property 'xxx' does not exist on type CombinedVueInstance](https://github.com/vuejs/vue/issues/8721)