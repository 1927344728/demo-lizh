module.exports = ({ file, options, env }) => ({
  plugins: {
    // "autoprefixer": {
    //   "overrideBrowserslist": [
    //     "> 0.1%",
    //     "last 2 versions",
    //     "Android >= 3.2",
    //     "Firefox >= 20",
    //     "iOS >= 7",
    //     "chrome >  20"
    //   ]
    // },
    // "postcss-nesting": {},
    "postcss-import": {},
    // "cssnano": {
    //   preset: ["default", {
    //       // 禁止插件对自定义动画名称的重命名
    //       reduceIdents: false,
    //       // 禁用postcss重写z-index值
    //       zindex: true
    //   }]
    // },
    // "postcss-mixins": {},
    "postcss-apply": {},
    "postcss-preset-env": {
      features: {
          "custom-properties": {
              preserve: false,
              variables: {}
          },
          "nesting-rules": true
      }
    },
    // "postcss-px2rem-exclude": {
    //   remUnit: 75,
    //   exclude: /node_modules|folder_name/i
    // }
  }
})