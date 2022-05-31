'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// const name = defaultSettings.title || window.localStorage.getItem('platformName') // 页面标题


// 所有配置项说明都可以在 https://cli.vuejs.org/config/ 中找到
module.exports = {
  /**
   * 如果您打算在子路径下部署站点，则需要设置publicPath，例如GitHub Pages。
   * 如果您打算将网站部署到https://foo.github.io/bar/，然后publicPath应该设置为“ / bar /”。
   * 在大多数情况下，请使用'/'！
   * 详细信息：https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',

  // ESLint校验风格 如果不想使用 ESLint 校验（不推荐取消），设置 lintOnSave: false 即可。
  // lintOnSave: process.env.NODE_ENV === 'development',
  lintOnSave: false,

  productionSourceMap: false,
  // devServer: {
  //   port: port,
  //   open: true,
  //   overlay: {
  //     warnings: false,
  //     errors: true
  //   },
  //   before: require('./mock/mock-server.js')
  // },
  devServer: {
    // 前端资源访问方式
    host: '0.0.0.0',
    port: 8023,
    proxy: {
      // 后端资源访问方式
      '/api/': {
        target: 'http://127.0.0.1:8024',
        changeOrigin: true,
      }
    },
  },
  configureWebpack: {

    // 在webpack的名称字段中提供应用程序的标题，以便可以在index.html中对其进行访问以注入正确的标题。
    // name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    // 可以提高第一个页面的速度，建议打开预加载
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // 忽略runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // 当页面太多时，会导致太多无意义的请求
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
