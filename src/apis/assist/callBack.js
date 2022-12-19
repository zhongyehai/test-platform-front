import request from '@/utils/request';  //加载请求配置文件
import {baseDirAssist} from "@/apis/base";

// 获取回调列表
export function callBackList(params) {
  return request({url: baseDirAssist + '/callBack/list', method: 'get', params: params});
}
