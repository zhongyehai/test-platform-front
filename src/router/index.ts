/**
 * @description 所有人可使用的参数配置列表
 * @params hideMenu: 是否隐藏当前路由结点不在导航中展示
 * @params alwayShow: 只有一个子路由时是否总是展示菜单，默认false
 */
import {reactive} from 'vue'
import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import store from '@/store'
import NProgress from '@/utils/system/nprogress'
import {changeTitle} from '@/utils/system/title'
import {ElMessage} from 'element-plus'

NProgress.configure({showSpinner: false})

// 引入不需要权限的modules
import Default from './modules/default'
import Dashboard from './modules/dashboard'
import ApiTest from './modules/api-test'
import UiTest from './modules/ui-test'
import AppTest from './modules/app-test'
import Script from './modules/script'
import Tools from './modules/tools'
import Assist from './modules/assist'
import TestManage from './modules/manage'
import Config from './modules/config'

import Debug from './modules/debug'
import System from './modules/system'
import {getmark} from "@/utils/watermark";

/**
 * @name 初始化必须要的路由
 * @description 使用reactive属性使得modules可以在路由菜单里面实时响应，搞定菜单回显的问题
 * @detail 针对modules的任何修改，均会同步至菜单级别，记住，是针对变量名为：moduels的修改
 **/
let modules = reactive([
    ...Default, ...Dashboard, ...ApiTest, ...UiTest, ...AppTest, ...Script, ...Tools, ...Assist, ...TestManage,
    ...Config, ...System, ...Debug
])

const router = createRouter({
    // history: createWebHashHistory(),  // 路由地址带 #
    history: createWebHistory(),  // 路由地址不带 #
    routes: modules
})

// 未授权时可访问的白名单
const whiteList = [
    '/login',
    '/self/login',
    '/sso/login',
    '/assist/error-record',
    '/tools/examination',
    '/tools/make-user-info',
    '/test-manage/account',
    '/api-test/report-show',
    '/ui-test/report-show',
    '/app-test/report-show'
]

// 路由跳转前的监听操作
router.beforeEach((to, _from, next) => {
    NProgress.start();
    // console.log('to: ', to)
    // console.log('_from: ', _from)
    // console.log('next: ', next)

    to.meta.title ? (changeTitle(to.meta.title)) : "" // 动态title
    // 白名单或者指定路由，直接放行
    if (whiteList.indexOf(to.path) !== -1 || to.path.indexOf('index') > -1 || to.path.indexOf('report-show') > -1) {
        next()
    } else {
        const hasToken = localStorage.getItem('accessToken')
        if (hasToken) {
            // 判断权限
            // @ts-ignore
            const permissions = JSON.parse(localStorage.getItem('permissions'))
            // console.log('permissions: ', permissions)
            if (localStorage.getItem('isAdmin') === '1' || permissions.indexOf(to.path) !== -1) {
                next()
            } else {
                ElMessage.error('没有权限')
                next(_from.path)
            }
        } else {
            next("/login"); // 既没有token，请求的路由又不在白名单里面，全部重定向到登录页
        }
    }
});

// 路由跳转后的监听操作
router.afterEach((to, _from) => {
    const keepAliveComponentsName = store.getters['keepAlive/keepAliveComponentsName'] || []
    // @ts-ignore
    const name = to.matched[to.matched.length - 1].components.default.name
    if (to.meta && to.meta.cache && name && !keepAliveComponentsName.includes(name)) {
        store.commit('keepAlive/addKeepAliveComponentsName', name)
    }

    // 加水印
    const {watermark} = getmark();
    const userName = localStorage.getItem("userName")
    watermark(userName ? `测试平台 - ${userName}` : '测试平台') //全局加水印名
    NProgress.done()
});

export {
    modules
}

export default router
