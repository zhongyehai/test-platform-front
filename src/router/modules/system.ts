import type { Route } from '../index.type'
import Layout from '@/layout/index.vue'
import { createNameComponent } from '../createNode'
const route: Route[] = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    hideMenu: false,
    meta: { title: '系统管理', icon: 'iconfont icon-testearth', alwaysShow: false },
    children: [
      {
        path: 'permission',
        component: createNameComponent(() => import('@/views/system/permission/index.vue')),
        meta: { title: '权限管理', icon: 'iconfont icon-testlink' }
      },
      {
        path: 'role',
        component: createNameComponent(() => import('@/views/system/role/index.vue')),
        meta: { title: '角色管理', icon: 'iconfont icon-testuser' }
      },
      {
        path: 'user',
        component: createNameComponent(() => import('@/views/system/user/index.vue')),
        meta: { title: '用户管理', icon: 'iconfont icon-testteam' }
      },
      {
        path: 'job',
        component: createNameComponent(() => import('@/views/system/job/index.vue')),
        meta: { title: '系统定时任务', icon: 'iconfont icon-testcalendar-check' }
      },
      {
        path: 'error-record',
        component: createNameComponent(() => import('@/views/system/error-record/index.vue')),
        meta: { title: '系统错误记录', icon: 'iconfont icon-testalert-fill' }
      },
      {
        path: 'platform',
        component: createNameComponent(() => import('@/views/system/platform/index.vue')),
        meta: { title: '平台使用分析', hideTabs: false, icon: 'iconfont icon-testbarchart' },
        children: [
          {
            path: 'overview',
            component: createNameComponent( () => import('@/views/system/platform/overview/index.vue')),
            meta: { title: '数据总览', icon: 'iconfont icon-testsignal-fill' }
          },
          {
            path: 'analyse',
            component: createNameComponent( () => import('@/views/system/platform/analyse/index.vue')),
            meta: { title: '业务线分析', icon: 'iconfont icon-testdijiaqushi' }
          }
        ]
      },
    ]
  }
]

export default route
