import request from '@/utils/system/request'
import {baseDirManage} from '../base-url'

const currentBaseDir = baseDirManage + '/env'
const accountBaseDir = baseDirManage + '/account'

export function GetEnvList(params: object) {
    return request({url: currentBaseDir + '/list', method: 'get', params: params})
}

export function GetEnv(params: object) {
    return request({url: currentBaseDir, method: 'get', params: params})
}

export function PostEnv(data: object) {
    return request({url: currentBaseDir, method: 'post', data: data})
}

export function PutEnv(data: object) {
    return request({url: currentBaseDir, method: 'put', data: data})
}

export function DeleteEnv(data: object) {
    return request({url: currentBaseDir, method: 'delete', data: data})
}

export function GetAccountList(params: object) {
    return request({url: accountBaseDir + '/list', method: 'get', params: params})
}

export function GetAccount(params: object) {
    return request({url: accountBaseDir, method: 'get', params: params})
}

export function PostAccount(data: object) {
    return request({url: accountBaseDir, method: 'post', data: data})
}

export function PutAccount(data: object) {
    return request({url: accountBaseDir, method: 'put', data: data})
}

export function DeleteAccount(data: object) {
    return request({url: accountBaseDir, method: 'delete', data: data})
}
