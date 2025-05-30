import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

const service: AxiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 5000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log('发送请求:', config.url, config.method, config.params || config.data);
        
        // 检查是否是加载mock数据的请求（以./或../开头的相对路径）
        if (config.url && (config.url.startsWith('./') || config.url.startsWith('../'))) {
            config.baseURL = ''; // 清空baseURL，使用相对路径
            console.log('使用相对路径请求mock数据');
        }
        
        // 从localStorage获取token添加到请求头
        const token = localStorage.getItem('vuems_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('添加认证Token到请求头');
        }

        // 处理日期格式
        if (config.params) {
            // 确保日期参数是有效的格式
            if (config.params.startDate || config.params.endDate) {
                console.log('处理日期参数:', {
                    startDate: config.params.startDate, 
                    endDate: config.params.endDate
                });
                
                // 如果需要转换日期格式，可以在这里处理
                // 例如将开始日期设置为当天的开始时间 00:00:00
                if (config.params.startDate && !config.params.startDate.includes(' ')) {
                    config.params.startDate = config.params.startDate + ' 00:00:00';
                }
                
                // 如果没有设置结束日期格式，确保它是当天的结束时间 23:59:59
                if (config.params.endDate && !config.params.endDate.includes(' ')) {
                    config.params.endDate = config.params.endDate + ' 23:59:59';
                }
                
                console.log('处理后的日期参数:', {
                    startDate: config.params.startDate, 
                    endDate: config.params.endDate
                });
            }
        }

        // 添加时间戳防止缓存
        if (config.method?.toLowerCase() === 'get') {
            config.params = { ...config.params, _t: Date.now() };
        }
        
        return config;
    },
    (error: AxiosError) => {
        console.error('请求发送失败:', error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('收到响应:', response.config.url, response.status, response.data);
        
        // 将201(Created)也视为成功状态
        if (response.status === 200 || response.status === 201) {
            // 调试日志
            if (response.config.url?.includes('orders')) {
                console.log('订单API响应数据:', JSON.stringify(response.data));
            }
            return response;
        } else {
            console.error('响应状态码异常:', response.status, response.statusText);
            return Promise.reject(new Error(response.statusText || '请求错误'));
        }
    },
    (error: AxiosError) => {
        console.error('API响应错误:', error.message);
        if (error.response) {
            console.error('错误状态:', error.response.status, error.response.statusText);
            console.error('错误数据:', error.response.data);
        }
        
        // 处理401未授权错误 - 移除提示信息，仅在非登录页时重定向
        if (error.response?.status === 401) {
            // 只有当不在登录页面时才清除token并跳转到登录页
            const currentPath = router.currentRoute.value.path;
            if (currentPath !== '/login') {
                console.log('401未授权，重定向到登录页');
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
