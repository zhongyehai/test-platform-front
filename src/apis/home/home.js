import request from '@/utils/request'
import {baseDirHome} from "@/apis/base";

// title统计
export function getTitleCount() {
  return request({ url: baseDirHome + '/count/title', method: 'get' })
}

// 对应的明细统计, detailType 对应的项，project、task、report...
export function getDetailCount(detailType) {
  return request({ url: baseDirHome + '/count/' + detailType, method: 'get' })
}
