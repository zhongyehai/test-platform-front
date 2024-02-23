import request from '@/utils/system/request'
import {baseDirAssist} from '../base-url'

const currentBaseDir = baseDirAssist

export function GetAutoTestUser(params: object) {
    return request({ url: currentBaseDir + '/auto-test-user', method: 'get', params: params })
}

export function GetDataPoolList(params: object) {
    return request({ url: currentBaseDir + '/data-pool/list', method: 'get', params: params })
}

export function PostDataPool(data: object) {
    return request({url: currentBaseDir + '/data-pool', method: 'post', data: data})
}

export function GetDataPool(params: object) {
    return request({url: currentBaseDir + '/data-pool', method: 'get', params: params})
}

export function PutDataPool(data: object) {
    return request({url: currentBaseDir + '/data-pool', method: 'put', data: data})
}

export function DeleteDataPool(data: object) {
    return request({url: currentBaseDir + '/data-pool', method: 'delete', data: data})
}

export function GetDataPoolUseStatus(params: object) {
    return request({ url: currentBaseDir + '/data-pool/use-status', method: 'get', params: params })
}

export function GetDataPoolBusinessStatus(params: object) {
    return request({ url: currentBaseDir + '/data-pool/business-status', method: 'get', params: params })
}
