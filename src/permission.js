/**
 * 1.判断是否登录，进行对应的处理
 * 2.获取用户权限动态生成可访问的路由
 */

import router from './router'
import store from './store'
import {Message} from 'element-ui'
import NProgress from 'nprogress' // 顶部页面加载进度条
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({showSpinner: false}) // showSpinner: false 隐藏显示加载中的转圈

// 白名单列表，不需要权限就可访问的路由
const whiteList = [
  '/login',
  '/apiTest/reportShow',
  '/apiTest/errorRecord',
  '/testManage/diffRecordShow',
  '/tools/examination', '/tools/makeUserInfo',

  '/uiTest/uiReportShow',
]

router.beforeEach(async (to, from, next) => {

  // 显示顶部页面加载进度条
  NProgress.start()

  // 根据路由中配置的meta.title更改页面标题
  document.title = getPageTitle(to.meta.title)

  // 如果是查看报告，则从 localStorage 中获取token，判断用户是否已登录
  const hasToken = to.path.indexOf('reportShow') !== -1 ? localStorage.getItem('token') : store.getters.token

  if (hasToken) {

    // 如果有token，判断权限
    if (to.path === '/login') {

      // 路由为登录页，直接放行
      next()  // 如果访问的是登录，则直接放行
      NProgress.done()  // 隐藏顶部页面加载进度条

    } else {
      // 如果访问的不是登录页，判断是否有权限访问此路由

      let roles = to.meta.roles  // 访问此路由需要的权限

      // 如果此路由有权限校验，则进行校验
      if (roles) {

        const user_role = store.getters.roles
        // 如果路由指定的权限数组包含当前用户的权限，则放行
        if (roles.indexOf(user_role) > -1) {
          next()
        } else {
          Message.error('没有权限')
        }
      } else {
        next()
      }
      NProgress.done()
    }
  } else {
    // 没有获取到token

    // 判断当前要访问的路由是否在白名单中
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果在白名单中，直接放行
      next()
    } else {
      // 如果不在白名单中，则跳转到/login，将要访问的路由，放在redirect参数上
      next(`/login?redirect=${to.path}`)
      // 隐藏顶部页面加载进度条
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 隐藏顶部页面加载进度条
})
