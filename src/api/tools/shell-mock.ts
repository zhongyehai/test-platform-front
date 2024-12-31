import request from '@/utils/system/request'
import {baseDirShellMockURL} from '../base-url'

const currentBaseDir = baseDirShellMockURL
export const uploadShellMockFileUrl = baseDirShellMockURL + '/file'

export function GetShellMockFileList(params: object) {
    return request({url: currentBaseDir + '/file-list', method: 'get', params: params})
}

export function DownloadShellMockFile(params: object) {
    return request({url: currentBaseDir + '/file', method: 'get', params: params, responseType: 'blob'})
}

export function UploadShellMockFile(data: object) {
    return request({url: currentBaseDir + '/file', method: 'post', data: data})
}

export function RunShellMock(data: object) {
    return request({url: currentBaseDir + '/run', method: 'post', data: data})
}

