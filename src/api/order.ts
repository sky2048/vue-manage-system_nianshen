import request from '../utils/request';

// 检查是否有token (管理员登录状态)
const isAdmin = () => {
    return !!localStorage.getItem('vuems_token');
};

// 获取订单列表
export const fetchOrderList = (params: any = {}) => {
    // 使用管理员接口获取所有订单，如果没有token则使用匿名接口
    const url = '/api/orders';
    
    console.log('调用订单列表API', url);
    return request({
        url,
        method: 'get',
        params
    });
};

// 创建订单
export const createOrder = (data: any) => {
    return request({
        url: '/api/orders',
        method: 'post',
        data
    });
};

// 获取订单详情
export const fetchOrderDetail = (id: number) => {
    return request({
        url: `/api/orders/${id}`,
        method: 'get'
    });
};

// 更新订单状态
export const updateOrderStatus = (id: number, data: any) => {
    if (!isAdmin()) {
        console.error('需要管理员权限才能更新订单状态');
        return Promise.reject(new Error('需要管理员权限'));
    }
    
    return request({
        url: `/api/orders/${id}`,
        method: 'put',
        data
    });
};

// 删除订单
export const deleteOrder = (id: number) => {
    if (!isAdmin()) {
        console.error('需要管理员权限才能删除订单');
        return Promise.reject(new Error('需要管理员权限'));
    }
    
    return request({
        url: `/api/orders/${id}`,
        method: 'delete'
    });
};

// 获取订单统计数据
export const fetchOrderStats = () => {
    return request({
        url: '/api/orders/stats',
        method: 'get'
    });
}; 