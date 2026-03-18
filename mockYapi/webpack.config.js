const path = require('path')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  // ✅ 设置为 Node 环境
  target: 'node',

  mode: 'development',
  devtool: 'source-map',

  entry: './background/main.js',

  output: {
    path: path.resolve(__dirname, './background/dist'),
    filename: 'main.js',  // ✅ 添加输出文件名
    libraryTarget: 'commonjs2'  // ✅ Node 模块格式
  },

  // ✅ 排除 node_modules，但保留 mockjs（需要自定义 loader 处理）
  externals: [
    nodeExternals({
      // whitelist 中的模块会被打包，其他 node_modules 不打包
      allowlist: [
        /mockjs/  // ✅ 确保 mockjs 被打包，以便自定义 loader 生效
      ]
    }),
    // ✅ 额外排除 node: 前缀的内置模块
    function (context, request, callback) {
      if (/^node:/.test(request)) {
        return callback(null, 'commonjs ' + request)
      }
      callback()
    }
  ],

  resolve: {
    extensions: ['.js', '.json']
  },

  module: {
    rules: [
      {
        // ✅ mockjs 特殊处理：替换 eval 代码
        test: /mockjs.*\.js$/,
        include: /node_modules/,
        use: [
          path.resolve(__dirname, './background/loader/replaceMockEvalLoader.js')
        ]
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'background'),
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { node: 'current' }
                }
              ]
            ],
            // 新增：移除 console 插件配置
            plugins: [
              // 开发环境保留 console.error/console.warn，生产环境全部移除
              ['transform-remove-console', {
                exclude: ['error', 'warn'] // 可选：保留 error/warn
              }]
            ]
          }
        }
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin() // 清理旧打包文件
  ]
}
