import type { Route } from '../index.type'
import Layout from '@/layout/index.vue'
import { createNameComponent } from '../createNode'

const route: Route[] = [
  {
    path: '/config',
    component: Layout,
    redirect: '/config/value',
    hideMenu: false,
    meta: { title: '配置管理', icon: 'iconfont icon-testsetting' },
    children: [
      {
        path: 'type',
        component: createNameComponent(() => import('@/views/config/config-type/index.vue')),
        meta: { title: '配置类型', icon: 'iconfont icon-testsetting' }
      },
      {
        path: 'value',
        component: createNameComponent(() => import('@/views/config/config-value/index.vue')),
        meta: { title: '配置参数', icon: 'iconfont icon-testsetting-fill' }
      },
      {
        path: 'run-env',
        component: createNameComponent(() => import('@/views/config/run-env/index.vue')),
        meta: { title: '运行环境', icon: 'iconfont icon-testdeploymentunit' }
      },
      {
        path: 'business',
        component: createNameComponent(() => import('@/views/config/config-business/index.vue')),
        meta: { title: '业务线管理', icon: 'iconfont icon-testunorderedlist' }
      },
      {
        path: 'webhook',
        component: createNameComponent(() => import('@/views/config/webhook/index.vue')),
        meta: { title: 'webhook管理', icon: 'iconfont icon-testmessage' }
      }
    ]
  }
]

export default route
