import request from '@/utils/system/request'
import {baseDirTool} from '../base-url'

const currentBaseDir = baseDirTool


export function MakeUser(params: object) {
    return request({url: currentBaseDir + '/make-user', method: 'get', params: params})
}

export function ExportAsContact(data: object) {
    return request({url: currentBaseDir + '/make-user/contact/download', method: 'post', data: data, responseType: 'blob' })
}
