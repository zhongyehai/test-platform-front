import type { Route } from '../index.type'
import Layout from '@/layout/index.vue'
import { createNameComponent } from '../createNode'

const route: Route[] = [
  {
    path: '/ui-test',
    component: Layout,
    redirect: '/ui-test/project',
    hideMenu: false,
    meta: { title: 'ui自动化', icon: 'iconfont icon-testneirong2' },
    children: [
      {
        path: 'project',
        component: createNameComponent(() => import('@/views/ui-test/project/index.vue')),
        meta: { title: '项目管理', icon: 'iconfont icon-testfolder-open-fill' }
      },
      {
        path: 'page',
        component: createNameComponent(() => import('@/views/ui-test/module/index.vue')),
        meta: { title: '页面管理', icon: 'iconfont icon-testneirong2' }
      },
      {
        path: 'case',
        component: createNameComponent(() => import('@/views/ui-test/case-suite/index.vue')),
        meta: { title: '用例管理', icon: 'iconfont icon-testcodepen' }
      },
      {
        path: 'task',
        component: createNameComponent(() => import('@/views/ui-test/task/index.vue')),
        meta: { title: '任务管理', icon: 'iconfont icon-testcalendar-check' }
      },
      {
        path: 'report-show',
        // @ts-ignore
        hideMenu: true,  // 不显示按钮
        component: createNameComponent(() => import('@/views/ui-test/report/show.vue')),
        meta: { title: '查看测试报告', icon: 'iconfont icon-testbarchart' }
      },
      {
        path: 'report',
        component: createNameComponent(() => import('@/views/ui-test/report/index.vue')),
        meta: { title: '测试报告', icon: 'iconfont icon-testbarchart' }
      },
    ]
  }
]

export default route
