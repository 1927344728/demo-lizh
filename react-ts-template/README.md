# react-ts-template
本项目基于 `create-react-app` 创建，封装以下特性：
* 采用 `craco.config.js` 修改配置：`style(modules、css、sass、postcss)`、`eslint`、`babel`、`webpack`、`devServer` 等。[查看更多配置详情](https://www.npmjs.com/package/@craco/craco)
* 自定义 `typescript`、`eslint`、`prettier`。
* 部分 postcss 插件: `postcss-import`、`postcss-preset-env`、`postcss-apply`、`postcss-css-variables`、`postcss-px2rem-exclude`。
* redux状态管理。
* router(路由)解决方案。
* 页面最小高度、IOS安全区域、HTML响应字体大小。
## 命令行
### `npm start`
在开发模式下运行应用程序。打开 [http://localhost:3000](http://localhost:3000) 以在浏览器中查看它。
如果你进行编辑，页面将重新加载。

### `npm test`
以交互式监视模式启动测试运行器。有关更多信息，请参阅有关 [运行测试](https://www.html.cn/create-react-app/docs/running-tests/) 的部分。

### `npm run build`
将生产应用程序构建到 build 文件夹。它能将 React 正确地打包为生产模式中并优化构建以获得最佳性能。
构建将被压缩，文件名中将包含哈希。有关更多信息，请参阅 [生产构建](https://www.html.cn/create-react-app/docs/production-build/) 部分。
这样你的应用已准备好部署了。有关将应用程序部署到服务器的详细信息，请参阅有关 [部署](https://www.html.cn/create-react-app/docs/deployment/) 的部分。

### `npm run eject`
注意：这是单向操作。一旦你 eject ，你就不能回去了！

如果你对构建工具和配置选项不满意，可以随时 eject 。此命令将从项目中删除单个构建依赖项。

相反，它会将所有配置文件和传递依赖项（Webpack，Babel，ESLint等）复制到项目中，以便你可以完全控制它们。除 eject 之外的所有命令仍然有效，但它们将指向复制的脚本，以便你可以调整它们。接下来你只能靠自己了。


### Typescript相关问题
1.文件引用出错
```js
import {
  WX_API_DOMAIN
} from '@/utils/variables'
```
`Cannot find module '@/utils/variables' or its corresponding type declarations.ts(2307) ` 
`Module '"@/utils/variables"' has no exported member 'WX_API_DOMAIN'.ts(2305)` 
**原因：**`tsconfig.paths.json`中的 `baseUrl`、`paths`配置有误，导致文件引用出错：

```js
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["./src"]
    }
  }
}
```
**解决：**

```js
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
