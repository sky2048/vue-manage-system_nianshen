import request from '../utils/request';

// 登录请求
export const login = (data: { username: string; password: string }) => {
    console.log('调用登录API:', data.username);
    return request({
        url: '/api/auth/login',
        method: 'post',
        data: data
    }).then(response => {
        // 登录成功后添加额外日志
        if (response.data && response.data.success) {
            const userData = response.data.data.user;
            console.log('登录成功，用户信息:', userData);
            console.log('用户角色:', userData.role);
            
            // 检查manager角色权限
            if (userData.role === 'manager') {
                console.log('当前用户是manager角色，权限检查');
                const permissKeys = localStorage.getItem('ms_keys');
                console.log('权限配置:', permissKeys);
            }
        }
        return response;
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

// 根据token获取用户信息
export const getUserInfo = () => {
    console.log('获取用户信息');
    return request({
        url: '/api/auth/me',
        method: 'get'
    });
}; 