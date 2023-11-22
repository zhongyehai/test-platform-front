import request from '@/utils/request'
import {baseDirTestWork} from '@/apis/base' // 加载请求配置文件

const currentBaseDir = baseDirTestWork + '/env'
const accountBaseDir = baseDirTestWork + '/account'

// 环境列表
export function envList(data) {
    return request({url: currentBaseDir + '/list', method: 'post', data: data})
}

// 获取环境
export function getEnv(params) {
    return request({url: currentBaseDir, method: 'get', params: params})
}

// 添加环境
export function postEnv(data) {
    return request({url: currentBaseDir, method: 'post', data: data})
}

// 修改环境
export function putEnv(data) {
    return request({url: currentBaseDir, method: 'put', data: data})
}

// 删除环境
export function deleteEnv(data) {
    return request({url: currentBaseDir, method: 'delete', data: data})
}


// 环境列表
export function accountList(data) {
    return request({url: accountBaseDir + '/list', method: 'post', data: data})
}

// 获取环境
export function getAccount(params) {
    return request({url: accountBaseDir, method: 'get', params: params})
}

// 添加环境
export function postAccount(data) {
    return request({url: accountBaseDir, method: 'post', data: data})
}

// 修改环境
export function putAccount(data) {
    return request({url: accountBaseDir, method: 'put', data: data})
}

// 删除环境
export function deleteAccount(data) {
    return request({url: accountBaseDir, method: 'delete', data: data})
}
