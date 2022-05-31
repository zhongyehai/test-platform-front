// 优化axios封装见：https://juejin.im/post/6844903652881072141

import axios from 'axios';
import router from "@/router/index";

// 创建对象，自定义实例默认值
const service = axios.create({
  // process.env.NODE_ENV === 'development' 来判断是否开发环境
  baseURL: '',
  timeout: 600000,  // 请求超时
  async: false
});


// 请求拦截，请求前置处理
service.interceptors.request.use(
  config => {
    let token = localStorage.getItem('token')
    if (token) {
      config.headers['X-Token'] = token
    }
    return config
  },
  /* eslint-disable */
  error => {
    // 在请求发生错误时做的处理
    this.$message.error('发送请求失败')
    return Promise.reject();
  }
);

// 响应拦截器，请求后置处理
service.interceptors.response.use(
  response => {
    // 如果返回msg为登录超时，则跳转到登录页面
    if (response.data['message'] === '登录超时,请重新登录') {
      // console.log(`requests.service.interceptors: /login?redirect=${router.history.current.fullPath}`)
      router.push({path: `/login?redirect=${router.history.current.fullPath}`});
    }
    return response.data
  }
);

export default service;
