import request from '@/utils/system/request'
import {baseDirAssist} from '../base-url'

const queueLinkDir = baseDirAssist + '/queue-link'
const queueDir = baseDirAssist + '/queue'

export function GetQueueLinkList(params: object) {
    return request({ url: queueLinkDir + '/list', method: 'get', params: params })
}

export function PostQueueLink(data: object) {
    return request({ url: queueLinkDir, method: 'post', data: data })
}

export function PutQueueLink(data: object) {
    return request({ url: queueLinkDir, method: 'put', data: data })
}

export function GetQueue(params: object) {
    return request({ url: queueDir, method: 'get', params: params })
}

export function DeleteQueue(data: object) {
    return request({ url: queueDir, method: 'delete', data: data })
}

export function GetQueueList(params: object) {
    return request({ url: queueDir + '/list', method: 'get', params: params })
}

export function PostQueue(data: object) {
    return request({ url: queueDir, method: 'post', data: data })
}

export function PutQueue(data: object) {
    return request({ url: queueDir, method: 'put', data: data })
}

export function SendMsgToQueue(data: object) {
    return request({ url: queueDir + '/message', method: 'POST', data: data })
}

export function CopyQueue(data: object) {
    return request({ url: queueDir + '/copy', method: 'post', data: data })
}

export function QueueSort(data: object) {
    return request({ url: queueDir + '/sort', method: 'put', data: data })
}

export function GetQueueLogList(params: object) {
    return request({ url: queueDir + '-log/list', method: 'get', params: params })
}
