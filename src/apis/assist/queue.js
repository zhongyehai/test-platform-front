import request from '@/utils/request' // 加载请求配置文件
import { baseDirAssist } from '@/apis/base'

const queueLinkDir = baseDirAssist + '/queue-link'
const queueDir = baseDirAssist + '/queue'

// 消息队列链接列表
export function queueLinkList(params) {
  return request({ url: queueLinkDir + '/list', method: 'get', params: params })
}

// 新增消息队列链接
export function postQueueLink(data) {
  return request({ url: queueLinkDir, method: 'post', data: data })
}

// 修改消息队列链接
export function putQueueLink(data) {
  return request({ url: queueLinkDir, method: 'put', data: data })
}

// 获取消息队列/队列链接
export function getQueue(params) {
  return request({ url: queueDir, method: 'get', params: params })
}

// 删除消息队列/队列链接
export function deleteQueue(data) {
  return request({ url: queueDir, method: 'delete', data: data })
}

// 消息队列列表
export function queueList(params) {
  return request({ url: queueDir + '/list', method: 'get', params: params })
}

// 新增消息队列
export function postQueue(data) {
  return request({ url: queueDir, method: 'post', data: data })
}

// 修改消息队列
export function putQueue(data) {
  return request({ url: queueDir, method: 'put', data: data })
}

// 发送消息
export function sendMsgToQueue(data) {
  return request({ url: queueDir + '/message', method: 'POST', data: data })
}

// 复制
export function copyQueue(data) {
  return request({ url: queueDir + '/copy', method: 'post', data: data })
}

// 修改排序
export function queueSort(data) {
  return request({ url: queueDir + '/sort', method: 'put', data: data })
}

// 修改排序
export function queueLogList(params) {
  return request({ url: queueDir + '-log/list', method: 'get', params: params })
}
