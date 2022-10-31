const Path = require('path')
const Webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpackConfig = {
    mode: 'development',
    entry: './src/postcss',
    output: {
        path: Path.resolve(__dirname, '../dist'),
        filename: 'postcss.js'
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
            filename: 'postcss.css',
            chunkFilename: 'chunkIndex.css',
        })
    ]
}
Webpack(webpackConfig, err => {})