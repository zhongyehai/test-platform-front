import request from '@/utils/request';
import {baseDirAssist} from "@/apis/base";  //加载请求配置文件

let currentBaseDir = baseDirAssist + '/dataPool'

// 获取数据池数据
export function getDataPool() {
  return request({url: currentBaseDir, method: 'get'})
}

// 自动化测试用户数据
export function getAutoTestUser(params) {
  return request({url: currentBaseDir + '/autoTestUser', method: 'get', params: params})
}
