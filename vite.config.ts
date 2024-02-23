import { ConfigEnv, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
// @ts-ignore
import {vitePluginSvg} from "@webxrd/vite-plugin-svg"
import { resolve } from 'path'

const pathResolve = (dir: string): any => {
  return resolve(__dirname, ".", dir)
}

const alias: Record<string, string> = {
  '@': pathResolve("src")
}

/**
 * @description-en vite document address
 * @description-cn vite官网
 * https://vitejs.cn/config/ */
export default ({ command }: ConfigEnv): UserConfigExport => {
  const prodMock = true;
  return {
    base: '/',
    resolve: {
      alias
    },
    server: {
      port: 8023,
      host: '0.0.0.0',
      open: true,
      proxy: {
        // 后端资源访问方式
        '/api/': {
          target: 'http://127.0.0.1:8024',
          changeOrigin: true
        }
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'echarts': ['echarts']
          }
        }
      }
    },
    plugins: [
      vue(),
      vitePluginSvg({
        // 必要的。必须是绝对路径组成的数组。
        iconDirs: [
            resolve(__dirname, 'src/assets/svg'),
        ],
        // 必要的。入口script
        main: resolve(__dirname, 'src/main.js'),
        symbolIdFormat: 'icon-[name]'
      }),
    ],
    css: {
      postcss: {
        plugins: [
            {
              postcssPlugin: 'internal:charset-removal',
              AtRule: {
                charset: (atRule) => {
                  if (atRule.name === 'charset') {
                    atRule.remove();
                  }
                }
              }
            }
        ],
      },
    }
  };
}
