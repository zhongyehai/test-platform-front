import request from '@/utils/request'
import { baseDirApiTest } from '@/apis/base'

const currentBaseDir = baseDirApiTest + '/stat'

// 使用总览卡片
export function useCard(params) {
  return request({ url: currentBaseDir + '/use/card', method: 'get', params: params })
}

// 使用总览柱状图
export function useChart(params) {
  return request({ url: currentBaseDir + '/use/chart', method: 'get', params: params })
}

// 业务线分析
export function analyseChart(params) {
  return request({ url: currentBaseDir + '/analyse', method: 'get', params: params })
}
