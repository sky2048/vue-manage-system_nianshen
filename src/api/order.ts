import request from '../utils/request';

// 检查是否有token (管理员登录状态)
const isAdmin = () => {
    return !!localStorage.getItem('vuems_token');
};

// 获取订单列表
export const fetchOrderList = (params: any = {}) => {
    // 使用管理员接口获取所有订单，如果没有token则使用匿名接口
    const url = isAdmin() ? 
        'http://localhost:5000/api/orders' : 
        'http://localhost:5000/api/orders/by-device';
    
    console.log('调用订单列表API', url);
    return request({
        url,
        method: 'get',
        params
    }).catch(error => {
        console.warn('获取订单数据失败，详细错误:', error);
        console.warn('使用模拟数据:');
        return getMockOrderList();
    });
};

// 获取模拟订单数据
function getMockOrderList() {
    // 模拟订单数据
    const mockOrders = [
        {
            id: 1,
            companyName: '深圳市优创科技有限公司',
            legalPerson: '张三',
            registrationCode: '91440300MA5EDB7L1X',
            amount: 1999.00,
            orderType: '公司注册',
            payStatus: '已支付',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            companyName: '北京未来智能科技有限公司',
            legalPerson: '李四',
            registrationCode: '91110105MA002XPL4A',
            amount: 3999.00,
            orderType: '税务咨询',
            payStatus: '未支付',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 3,
            companyName: '广州市泰和贸易有限公司',
            legalPerson: '王五',
            registrationCode: '91440101MA59RTCX4R',
            amount: 2500.00,
            orderType: '代理记账',
            payStatus: '已支付',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    return Promise.resolve({
        data: {
            success: true,
            data: {
                orders: mockOrders,
                total: mockOrders.length,
                page: 1,
                limit: 10
            }
        }
    });
}

// 获取订单详情
export const fetchOrderDetail = (id: number) => {
    return request({
        url: `http://localhost:5000/api/orders/${id}`,
        method: 'get'
    }).catch(error => {
        console.warn('获取订单详情失败，使用模拟数据:', error);
        // 返回模拟的详情数据
        const mockOrder = {
            id: id,
            companyName: '深圳市优创科技有限公司',
            legalPerson: '张三',
            registrationCode: '91440300MA5EDB7L1X',
            amount: 1999.00,
            orderType: '公司注册',
            payStatus: '已支付',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return Promise.resolve({
            data: {
                success: true,
                data: mockOrder
            }
        });
    });
};

// 更新订单状态
export const updateOrderStatus = (id: number, data: any) => {
    if (!isAdmin()) {
        console.error('需要管理员权限才能更新订单状态');
        return Promise.reject(new Error('需要管理员权限'));
    }
    
    return request({
        url: `http://localhost:5000/api/orders/${id}`,
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
        url: `http://localhost:5000/api/orders/${id}`,
        method: 'delete'
    });
};

// 获取订单统计数据
export const fetchOrderStats = () => {
    if (isAdmin()) {
        // 如果有登录token，使用真实API
        return request({
            url: 'http://localhost:5000/api/orders/stats',
            method: 'get'
        }).catch(error => {
            console.warn('获取订单统计失败，使用模拟数据:', error);
            return getMockOrderStats();
        });
    } else {
        // 如果没有token，返回模拟数据
        return getMockOrderStats();
    }
}; 

// 获取模拟订单统计数据
function getMockOrderStats() {
    return Promise.resolve({
        data: {
            success: true,
            data: {
                todayOrderCount: 5,
                todayIncome: 5000,
                totalOrderCount: 35,
                totalIncome: 35000
            }
        }
    });
} 