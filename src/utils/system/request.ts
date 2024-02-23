import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import store from '@/store'
import router from '@/router/index'
import {ElMessage} from 'element-plus'

const service: AxiosInstance = axios.create({
    baseURL: '', //baseURL,
    timeout: 60000  // 毫秒
})

// 请求拦截
service.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        if (token) {
            // @ts-ignore
            config.headers['X-Token'] = token
        }
        return config
    },
    (error: AxiosError) => {
        ElMessage.error('发送请求失败')
        return Promise.reject(error)
    }
)

// 响应拦截
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const responseBody = response.data
        // 身份验证相关
        if (responseBody.status === 401) { // 如果返回状态码为401，则跳转到登录页面
            // ElMessage.error(responseBody.message)
            let fullPath = router.currentRoute.value.fullPath
            if (responseBody.data) {  // 返回了登录地址，则自动重定向到对应的登录页（SSO）
                window.location.href = responseBody.data
            } else {
                // window.location.href = fullPath.indexOf('redirect') !== -1 ? fullPath : `/self/login?redirect=${fullPath}`
                window.location.href = fullPath.indexOf('redirect') !== -1 ? fullPath : `/self/login`
            }
        } else if (responseBody.status === 403) {
            ElMessage.error(responseBody.message)
        } else {
            // 业务逻辑相关
            // @ts-ignore
            // if (response.config.url.indexOf('list') === -1) {  // 非获取list的接口，显示响应信息
            if (response.config.method !== 'get') {  // 非获取的接口，显示响应信息
                if (responseBody.status >= 500) {
                    ElMessage.error(responseBody.message)
                    return
                } else if (responseBody.status >= 400) {
                    ElMessage.warning(responseBody.message)
                    return
                } else {
                    if (response.config.url.indexOf('download') === -1){
                        ElMessage.success(responseBody.message)
                    }
                    return responseBody
                }
            }
        }
        return responseBody
    },
    (error: AxiosError) => {
        const badMessage: any = error.message || error
        const code = parseInt(badMessage.toString().replace('Error: Request failed with status code ', ''))
        showError({code, message: badMessage})
        return Promise.reject(error)
    }
)

// 错误处理
function showError(error: any) {
    // token过期，清除本地数据，并跳转至登录页面
    if (error.code === 403) {
        // to re-login
        store.dispatch('user/loginOut')
    } else {
        ElMessage({
            message: error.msg || error.message || '服务异常',
            type: 'error',
            duration: 3 * 1000
        })
    }

}

export default service
