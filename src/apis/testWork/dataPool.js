import request from '@/utils/request';
import {baseDirTestWork} from "@/apis/base";  //加载请求配置文件

// 获取数据池数据
export function getDataPool() {
  return request({url: baseDirTestWork + '/dataPool', method: 'get'})
}

// 环境列表
export function getEnvList() {
  return request({url: baseDirTestWork + '/env/list', method: 'get'})
}

// 自动化测试用户数据
export function getAutoTestUser(params) {
  return request({url: baseDirTestWork + '/autoTestUser', method: 'get', params: params})
}
