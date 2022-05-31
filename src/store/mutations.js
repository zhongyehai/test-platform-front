/**
 * vuex-mutation 赋值操作，把状态更新到store
 */

import * as types from "./types";


export const mutations = {

    // 给 token 赋值操作
    [types.token]: (state, data) => {
        localStorage.token = data;
        state.token = data;
    },

    // 给 userName 赋值操作
    [types.userName]: (state, data) => {
        localStorage.userName = data;
        state.userName = data;
    },

    // 给 roles 赋值操作
    [types.roles]: (state, data) => {
        localStorage.roles = data;
        state.roles = data;
    },

    // 退出操作
    [types.logout]: (state) => {
        localStorage.removeItem('token');
        state.token = null
    },

    // 给 title 赋值操作
    [types.title]: (state, data) => {
        state.title = data;
    },


    // 修改 draging 状态
    changeDrag(state, bool) {
        state.working.draging = bool;
    },

    setMinder(state, data) {
        state.minder = data
    },

    setEditor(state, data) {
        state.editor = data
    },

    changeSave(state, bool) {
        state.working.saving = bool;
    },

    changeCount(state) {
        state.count++;
    },

    increment(state) {
        state.count++
    },

    decrement(state) {
        state.count--
    },

    registerEvent(state, callback) {
        state.callbackQueue.push(callback);
    },

    setConfig(state) {
        var supported = Object.keys(state.config);
        var configObj = {};

        // 支持全配置
        if (typeof key === 'object') {
            configObj = key;
        } else {
            configObj[key] = value;
        }

        for (var i in configObj) {
            if (configObj.hasOwnProperty(i) && supported.indexOf(i) !== -1) {
                state.config[i] = configObj[i];
            } else {
                console.error('Unsupported config key: ', key, ', please choose in :', supported.join(', '));
                return false;
            }
        }
        return true;
    }
}
