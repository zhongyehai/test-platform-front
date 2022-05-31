import request from '@/utils/request';
import {baseDirTestWork} from "@/apis/base";  //加载请求配置文件

// 添加kym
export function addKYM(data) {
  return request({url: baseDirTestWork + '/kym/project', method: 'post', data: data})
}

// 获取kym服务列表
export function KYMProjectList() {
  return request({url: baseDirTestWork + '/kym/project/list', method: 'get'})
}

// 获取服务的kym
export function getProjectKYM(params) {
  return request({url: baseDirTestWork + '/kym', method: 'get', params: params})
}

// 修改服务的kym
export function putProjectKYM(data) {
  return request({url: baseDirTestWork + '/kym', method: 'put', data: data})
}

// kym导出为xmind
export function getKymAsXmind(params) {
  return request({url: baseDirTestWork + '/kym/download', method: 'get', params: params, responseType: 'blob'})
}
