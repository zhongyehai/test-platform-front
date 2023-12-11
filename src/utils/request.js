// 优化axios封装见：https://juejin.im/post/6844903652881072141

import axios from 'axios'
import router from '@/router/index'
import { Message } from 'element-ui'

// 创建对象，自定义实例默认值
const service = axios.create({
  // process.env.NODE_ENV === 'development' 来判断是否开发环境
  baseURL: '',
  timeout: 600000, // 请求超时
  async: false
})

// 请求拦截，请求前置处理
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['X-Token'] = token
    }
    return config
  },
  /* eslint-disable */
  error => {
    // 在请求发生错误时做的处理
    Message.error('发送请求失败')
    return Promise.reject();
  }
);

// 响应拦截器，请求后置处理
service.interceptors.response.use(
  response => {
    // 如果返回状态码为401，则跳转到登录页面
    if (response.data.status === 401) {
      Message.error(response.data.message)
      if (response.data.data){  // 返回了登录地址，则自动重定向到对应的登录页（SSO）
        window.location.href = response.data.data
      }
      else if (router.history.current.fullPath.indexOf('redirect') !== -1){
        router.push({path: router.history.current.fullPath});
      }else {
        router.push({path: `/login?redirect=${router.history.current.fullPath}`});
      }
    }else if(response.data.status === 403){
      Message.error(response.data.message)
    }
    return response.data
  }
);

export default service;
