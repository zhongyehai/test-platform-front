import request from '@/utils/request';
import {baseDirTestWork} from "@/apis/base";  //加载请求配置文件

let currentBaseDir = baseDirTestWork + '/kym/'

// 添加kym
export function addKYM(data) {
  return request({url: currentBaseDir + 'project/', method: 'post', data: data})
}

// 获取kym服务列表
export function KYMProjectList() {
  return request({url: currentBaseDir + 'project/list/', method: 'get'})
}

// kym导出为xmind
export function getKymAsXmind(params) {
  return request({url: currentBaseDir + 'download/', method: 'get', params: params, responseType: 'blob'})
}

// 获取服务的kym
export function getProjectKYM(params) {
  return request({url: currentBaseDir, method: 'get', params: params})
}

// 修改服务的kym
export function putProjectKYM(data) {
  return request({url: currentBaseDir,  method: 'put', data: data})
}


