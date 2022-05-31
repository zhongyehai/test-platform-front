import Vue from 'vue'
import ElementUI from 'element-ui'
import VCharts from 'v-charts';
import AFTableColumn from 'af-table-column'  // el-table-column自适应宽度
import VueClipboard from 'vue-clipboard2'  // 复制内容到粘贴板

import 'normalize.css/normalize.css' // CSS重置的现代替代方案
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // 全局css
import '@/icons' // icon
import '@/permission' // 权限控制

import App from './App'
import store from './store'
import router from './router'
import showMessage from '@/utils/showMessage';
import busEvents from "@/utils/busEvents";

Vue.use(VCharts);
Vue.use(showMessage);
Vue.use(ElementUI)
Vue.use(AFTableColumn)
Vue.use(VueClipboard)

// 事件总线，用 this.$bus 使用
Vue.prototype.$bus = new Vue()
// 具体事件，把事件添加到 busEvents字典中，用 this.$busEvents.事件名 使用
Vue.prototype.$busEvents = busEvents

Vue.config.productionTip = false // 阻止显示生产模式的消息

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
