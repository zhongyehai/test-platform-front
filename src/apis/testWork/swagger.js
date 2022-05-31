import request from '@/utils/request';  //加载请求配置文件
import {baseDirTestWork} from "@/apis/base";

// 同步swagger的信息
export function swaggerPull(data) {
  return request({url: baseDirTestWork + '/swagger/pull', method: 'post', data: data});
}
