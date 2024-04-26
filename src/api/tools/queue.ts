import request from '@/utils/system/request'
import {baseDirAssist} from '../base-url'

const queueLinkDir = baseDirAssist + '/queue-link'
const queueTopicDir = baseDirAssist + '/queue-topic'

export function GetQueueLinkList(params: object) {
    return request({url: queueLinkDir + '/list', method: 'get', params: params})
}

export function ChangQueueLinkSort(data: object) {
    return request({url: queueLinkDir + '/sort', method: 'put', data: data})
}

export function GetQueueLink(params: object) {
    return request({url: queueLinkDir, method: 'get', params: params})
}

export function PostQueueLink(data: object) {
    return request({url: queueLinkDir, method: 'post', data: data})
}

export function PutQueueLink(data: object) {
    return request({url: queueLinkDir, method: 'put', data: data})
}

export function GetQueueTopicList(params: object) {
    return request({url: queueTopicDir + '/list', method: 'get', params: params})
}

export function ChangQueueTopicSort(data: object) {
    return request({url: queueTopicDir + '/sort', method: 'put', data: data})
}

export function SendMsgToQueueTopic(data: object) {
    return request({url: queueTopicDir + '/message', method: 'POST', data: data})
}

export function CopyQueueTopic(data: object) {
    return request({url: queueTopicDir + '/copy', method: 'post', data: data})
}

export function GetQueueTopicLogList(params: object) {
    return request({url: queueTopicDir + '/log', method: 'get', params: params})
}

export function GetQueueTopic(params: object) {
    return request({url: queueTopicDir, method: 'get', params: params})
}

export function DeleteQueueTopic(data: object) {
    return request({url: queueTopicDir, method: 'delete', data: data})
}

export function PostQueueTopic(data: object) {
    return request({url: queueTopicDir, method: 'post', data: data})
}

export function PutQueueTopic(data: object) {
    return request({url: queueTopicDir, method: 'put', data: data})
}
