import request from '@/utils/request';
import {baseDirAssist} from "@/apis/base";  //加载请求配置文件

// 自动化测试用户数据
export function getAutoTestUser(params) {
  return request({url: baseDirAssist + '/autoTestUser', method: 'get', params: params})
}
