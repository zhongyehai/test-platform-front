import type { Route } from '../index.type'
import Layout from '@/layout/index.vue'
import { createNameComponent } from '../createNode'

const route: Route[] = [
  {
    path: '/tools',
    component: Layout,
    redirect: '/tools/data-pool',
    hideMenu: false,
    meta: { title: '造数工具', icon: 'tool' },
    children: [
      {
        path: 'make-data',
        component: createNameComponent(() => import('@/views/tools/make-business-data/index.vue')),
        meta: { title: '造数据', icon: 'followUpDateSort' }
      },
      {
        path: 'data-pool',
        component: createNameComponent(() => import('@/views/tools/data-pool/index.vue')),
        meta: { title: '数据池', icon: 'dataThree' }
      },
      {
        path: 'make-user-info',
        component: createNameComponent(() => import('@/views/tools/make-user-info/index.vue')),
        meta: { title: '生成用户信息', icon: 'idCardH' }
      },
      {
        path: 'queue',
        component: createNameComponent(() => import('@/views/tools/queue/queue-link/index.vue')),
        meta: { title: '消息队列', icon: 'databaseEnter' }
      },
      {
        path: 'token',
        component: createNameComponent(() => import('@/views/tools/parse-token/index.vue')),
        meta: { title: '解析token', icon: 'userPositioning' }
      }
    ]
  }
]

export default route
