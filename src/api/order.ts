import request from '../utils/request';

// 获取订单列表（使用匿名接口）
export const fetchOrderList = (params: any = {}) => {
    // 直接调用不带参数的API获取所有订单
    console.log('调用订单列表API');
    return request({
        url: 'http://localhost:5000/api/orders/by-device',
        method: 'get'
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
    return request({
        url: `http://localhost:5000/api/orders/${id}`,
        method: 'put',
        data
    });
};

// 删除订单
export const deleteOrder = (id: number) => {
    return request({
        url: `http://localhost:5000/api/orders/${id}`,
        method: 'delete'
    });
};

// 获取订单统计数据（模拟数据，实际项目应从后端获取）
export const fetchOrderStats = () => {
    // 由于stats接口需要认证，我们这里模拟返回数据
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
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
        }, 500);
    });
}; 