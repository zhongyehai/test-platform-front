import request from '@/utils/request';
import {baseDirAssist} from "@/apis/base";  //加载请求配置文件

// 获取数据池数据
export function getDataPool() {
  return request({url: baseDirAssist + '/dataPool', method: 'get'})
}

// 自动化测试用户数据
export function getAutoTestUser(params) {
  return request({url: baseDirAssist + '/autoTestUser', method: 'get', params: params})
}
