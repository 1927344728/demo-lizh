# vue-cli项目模板
1.基于vue-cli创建的项目模板，包含mixin、vuex、axios，封装微信授权、分享等函数，处理了IOS设备底部安全区域问题、fixed元素错位问题。  
2.定义了一些css基础样式、变量等。

## 项目安装
```
npm install
```

### 开发环境，编译并热加载
```
npm run serve
```

### 生产环境，编译及压缩优化。
```
npm run build
```

### 校验及自动修复
```
npm run lint
```

### 自定义配置
See [Configuration Reference](https://cli.vuejs.org/config/).

### 备注
1.该项目使用了postcss 8.x.x版本，而postcss-mixins插件没有更新到postcss 8.x.x。因此，该项目暂时无法使用postcss-mixins插件。[查看详情](https://github.com/postcss/postcss/wiki/PostCSS-8-for-end-users)  
备注：样式混入，可用[postcss-apply](https://www.npmjs.com/package/postcss-apply)  
2.`.css`文件报错后，可能导致编译出问题，无法再实时编译css文件。重新保存一下vue文件可恢复正常。
