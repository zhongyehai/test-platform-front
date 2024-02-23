import type { Route } from '../index.type'
import Layout from '@/layout/index.vue'
import { createNameComponent } from '../createNode'

const route: Route[] = [
  {
    path: '/tools',
    component: Layout,
    redirect: '/tools/data-pool',
    hideMenu: false,
    meta: { title: '造数工具', icon: 'iconfont icon-testwrench' },
    children: [
      {
        path: 'make-data',
        component: createNameComponent(() => import('@/views/tools/make-business-data/index.vue')),
        meta: { title: '造数据', icon: 'iconfont icon-testlogin' }
      },
      {
        path: 'data-pool',
        component: createNameComponent(() => import('@/views/tools/data-pool/index.vue')),
        meta: { title: '数据池', icon: 'iconfont icon-testyouzhimaoyiqu' }
      },
      {
        path: 'make-user-info',
        component: createNameComponent(() => import('@/views/tools/make-user-info/index.vue')),
        meta: { title: '生成用户信息', icon: 'iconfont icon-testadduser' }
      },
      {
        path: 'queue',
        component: createNameComponent(() => import('@/views/tools/queue/index.vue')),
        meta: { title: '消息队列', icon: 'iconfont icon-testdatabase' }
      },
      {
        path: 'token',
        component: createNameComponent(() => import('@/views/tools/parse-token/index.vue')),
        meta: { title: '解析token', icon: 'iconfont icon-testswitchuser' }
      }
    ]
  }
]

export default route
