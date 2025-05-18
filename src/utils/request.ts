import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

const service: AxiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 5000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从localStorage获取token添加到请求头
        const token = localStorage.getItem('vuems_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        // 将201(Created)也视为成功状态
        if (response.status === 200 || response.status === 201) {
            return response;
        } else {
            return Promise.reject(new Error(response.statusText || '请求错误'));
        }
    },
    (error: AxiosError) => {
        console.log('API错误', error);
        
        // 处理401未授权错误 - 移除提示信息，仅在非登录页时重定向
        if (error.response?.status === 401) {
            // 只有当不在登录页面时才清除token并跳转到登录页
            const currentPath = router.currentRoute.value.path;
            if (currentPath !== '/login') {
                localStorage.removeItem('vuems_token');
                router.push('/login');
            }
            // 登录页面的401错误由登录页面自行处理，不显示全局消息
        } else if (error.response?.status === 403) {
            ElMessage.error('没有权限访问此资源');
        } else {
            // 其他错误保持原样
            if (error.message !== 'canceled') {
                ElMessage.error(error.message || '未知错误');
            }
        }
        
        return Promise.reject(error);
    }
);

export default service;
