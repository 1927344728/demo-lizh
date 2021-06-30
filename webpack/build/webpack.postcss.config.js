const Path = require('path')
const Webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpackConfig = {
    mode: 'development',
    entry: './src/index',
    output: {
        path: Path.resolve(__dirname, '../dist'),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                // 使用 PostCSS 处理 CSS 文件
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'index.css',
            chunkFilename: 'chunkIndex.css',
        })
    ]
}
Webpack(webpackConfig, err => {})