import request from '../utils/request';

// 登录接口
export const login = (data: { username: string; password: string }) => {
    return request({
        url: '/api/auth/login',
        method: 'post',
        data
    });
};

// 注册接口
export const register = (data: { username: string; password: string; email?: string; phone?: string }) => {
    return request({
        url: '/api/auth/register',
        method: 'post',
        data
    });
};

// 获取用户信息
export const getUserInfo = () => {
    return request({
        url: '/api/auth/me',
        method: 'get'
    });
}; 