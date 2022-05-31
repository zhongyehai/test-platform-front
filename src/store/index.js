/**
 * 统一导出 vuex 的所有状态、操作
 */

import Vuex from 'vuex'
import Vue from 'vue'

// import * as getters from './getters'
import getters from './getters'
import {actions} from './actions'
import {mutations} from './mutations'
import {state} from './state'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'

Vue.use(Vuex);
const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user
  },
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations,

})

export default store
