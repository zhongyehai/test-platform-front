import request from '@/utils/request';
import {baseDirTool} from "@/apis/base";  //加载请求配置文件

// 获取生成用户信息可选项映射关系
export function makeUserInfoMapping() {
  return request({url: baseDirTool + '/makeUserMapping', method: 'get'});
}

// 生成用户信息
export function makeUser(params) {
  return request({url: baseDirTool + '/makeUser', method: 'get', params: params});
}
