import request from '@/utils/request'
import {baseDirHome} from "@/apis/base";

let currentBaseDir = baseDirHome + '/apiTest'

// title统计
export function getTitleCount() {
  return request({url: currentBaseDir + '/title', method: 'get'})
}

// 对应的明细统计, detailType 对应的项，project、task、report...
export function getDetailCount(detailType) {
  return request({url: currentBaseDir + '/' + detailType, method: 'get'})
}
