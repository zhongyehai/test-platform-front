import request from '@/utils/request';  //加载请求配置文件
import {baseDirTestWork} from "@/apis/base";

// 获取错误列表
export function errorRecordList(params) {
  return request({url: baseDirTestWork + '/errorRecord/list', method: 'get', params: params});
}
