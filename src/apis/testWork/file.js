import request from '@/utils/request';
import {baseDirTestWork} from "@/apis/base";  //加载请求配置文件

export const uploadApi = baseDirTestWork + '/file'

export const uploadAddr = baseDirTestWork + '/upload'

// 上传文件
export function fileUpload(data) {
  return request({url: uploadAddr, method: 'post', data: data});
}

function Func(method, data = null, params = null) {
  return request({url: uploadApi, method: method, data: data, params: params});
}

// 文件列表
export function fileList(params) {
  return request({url: baseDirTestWork + '/file/list', method: 'get', params: params});
}

// 下载文件
export function fileDownload(params) {
  return request({url: baseDirTestWork + '/file/download', method: 'get', params: params, responseType: 'blob'});
}

// 校验文件是否已存在
export function fileCheck(params) {
  return request({url: baseDirTestWork + '/file/check', method: 'get', params: params});
}

// 上传文件
export function filePost(data) {
  return Func('post', data)
}

// 下载文件
export function fileGet(params) {
  return Func('get', '', params)
}

// 删除文件
export function fileDelete(data) {
  return Func('delete', data)
}
