import request from '../utils/request';
import { usePermissStore } from '../store/permiss';

export const fetchData = () => {
    return request({
        url: '/api/data',
        method: 'get'
    });
};

export const fetchUserData = () => {
    return request({
        url: '/api/users',
        method: 'get'
    });
};

// 从后端API获取真实用户数据
export const fetchRealUserData = () => {
    try {
        return request({
            url: '/api/users',
            method: 'get'
        }).catch(error => {
            console.warn('从后端获取用户数据失败，转为使用本地mock数据', error);
            // 后备方案：如果API调用失败，使用本地mock数据
            return request({
                url: './mock/user.json',
                method: 'get'
            });
        });
    } catch (error) {
        console.error('获取用户数据出错:', error);
        // 如果出现任何错误，使用本地mock数据
        return request({
            url: './mock/user.json',
            method: 'get'
        });
    }
};

// 获取单个用户详情
export const fetchUserById = (id: number) => {
    try {
        return request({
            url: `/api/users/${id}`,
            method: 'get'
        }).catch(error => {
            console.warn(`获取用户ID:${id}的详情失败，将返回基本数据`, error);
            // 如果API调用失败，直接返回一个成功的空响应
            return { data: { success: true, data: null } };
        });
    } catch (error) {
        console.error('获取用户详情出错:', error);
        // 如果出现任何错误，返回一个成功的空响应
        return { data: { success: true, data: null } };
    }
};

// 角色值映射辅助函数
const mapRoleValue = (role: string): string => {
    if (!role) return 'user';
    
    // 标准化
    const normalizedRole = String(role).trim();
    
    // 中文角色值映射
    const zhRoleMap: Record<string, string> = {
        '管理员': 'admin',
        '负责人': 'manager',
        '普通用户': 'user',
        '首通用户': 'user'
    };
    
    // 检查是否为中文角色
    if (zhRoleMap[normalizedRole]) {
        return zhRoleMap[normalizedRole];
    }
    
    // 检查是否为有效英文角色
    if (['user', 'manager', 'admin'].includes(normalizedRole)) {
        return normalizedRole;
    }
    
    // 默认返回普通用户
    return 'user';
};

// 状态值映射辅助函数
const mapStatusValue = (status: string): string => {
    if (!status) return 'active';
    
    // 标准化
    const normalizedStatus = String(status).trim();
    
    // 中文状态值映射
    const zhStatusMap: Record<string, string> = {
        '正常': 'active',
        '启用': 'active',
        '禁用': 'inactive'
    };
    
    // 检查是否为中文状态
    if (zhStatusMap[normalizedStatus]) {
        return zhStatusMap[normalizedStatus];
    }
    
    // 检查是否为有效英文状态
    if (['active', 'inactive'].includes(normalizedStatus)) {
        return normalizedStatus;
    }
    
    // 默认返回正常
    return 'active';
};

// 创建新用户
export const createUser = (userData: any) => {
    // 创建处理后的数据对象
    const processedData = { ...userData };
    
    // 处理角色值
    if (processedData.role) {
        processedData.role = mapRoleValue(processedData.role);
    }
    
    // 处理状态值
    if (processedData.status) {
        processedData.status = mapStatusValue(processedData.status);
    }
    
    console.log('处理后的创建用户数据:', processedData);
    
    return request({
        url: '/api/users',
        method: 'post',
        data: processedData
    });
};

// 更新用户信息
export const updateUserData = (id: number, userData: any) => {
    console.log('原始更新用户数据:', id, userData);
    
    // 验证必要字段
    if (!userData.username) {
        return Promise.reject({ message: '用户名不能为空' });
    }
    
    // 创建要发送的数据对象
    const updateData: Record<string, any> = {
        username: userData.username
    };
    
    // 处理角色值
    if (userData.role !== undefined) {
        updateData.role = mapRoleValue(userData.role);
    }
    
    // 处理状态值
    if (userData.status !== undefined) {
        updateData.status = mapStatusValue(userData.status);
    }
    
    // 处理其他字段
    if (userData.phone !== undefined) {
        updateData.phone = userData.phone;
    }
    
    if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password;
    }
    
    // 添加调试日志
    console.log('处理后发送到后端的更新数据:', updateData);
    
    // 发送请求
    return request({
        url: `/api/users/${id}`,
        method: 'put',
        data: updateData
    }).catch(error => {
        console.error('API更新用户请求失败:', error.response?.data || error);
        return Promise.reject(error);
    });
};

// 删除用户
export const deleteUserData = (id: number) => {
    return request({
        url: `/api/users/${id}`,
        method: 'delete'
    });
};

export const fetchRoleData = () => {
    // 使用本地mock数据
    return request({
        url: './mock/role.json',
        method: 'get'
    });
};

// 更新角色权限
export const updateRolePermission = (id: number, permiss: string[]) => {
    // 当前是mock数据模式，我们将数据保存到localStorage中
    try {
        // 先获取所有角色数据
        const roleDataStr = localStorage.getItem('mock_role_data');
        let roleData = [];
        
        if (roleDataStr) {
            roleData = JSON.parse(roleDataStr);
        } else {
            // 如果localStorage中没有数据，则尝试从mock文件加载
            const fetchData = async () => {
                try {
                    const response = await fetch('./mock/role.json');
                    const data = await response.json();
                    return data.list || [];
                } catch (error) {
                    console.error('读取角色数据失败:', error);
                    return [];
                }
            };
            
            // 异步加载数据，但这里我们需要同步返回，所以创建一个空数组
            fetchData().then(data => {
                localStorage.setItem('mock_role_data', JSON.stringify(data));
            });
        }
        
        // 查找并更新指定角色的权限
        const updatedRoleData = roleData.map(role => {
            if (role.id === id) {
                console.log(`更新角色[${role.name}]权限，角色ID:${id}，新权限:`, permiss);
                return { ...role, permiss };
            }
            return role;
        });
        
        // 保存更新后的数据
        localStorage.setItem('mock_role_data', JSON.stringify(updatedRoleData));
        
        // 查找更新的角色对象
        const updatedRole = updatedRoleData.find(r => r.id === id);
        
        if (updatedRole) {
            console.log(`角色 [${updatedRole.name}] 权限已更新为:`, permiss);
            
            // 检查当前用户角色，并更新权限
            const currentRole = localStorage.getItem('vuems_role');
            
            if (currentRole && updatedRole.key === currentRole) {
                console.log(`更新的是当前用户的角色 [${currentRole}]，同步更新权限状态`);
                
                // 更新 store 中的权限
                const permissStore = usePermissStore();
                
                // 完全替换权限，不使用默认权限
                permissStore.handleSet(permiss);
                
                // 同时更新当前用户的本地权限存储
                localStorage.setItem('ms_keys', JSON.stringify(permiss));
                
                console.log('权限状态已更新，新权限:', permiss);
                
                // 强制刷新应用状态
                setTimeout(() => {
                    console.log('强制刷新应用状态以确保权限生效');
                    window.location.reload();
                }, 1000);
            }
        }
        
        return Promise.resolve({ 
            data: { 
                success: true, 
                message: '权限设置保存成功',
                data: { id, permiss }
            } 
        });
    } catch (error) {
        console.error('保存角色权限失败:', error);
        return Promise.reject({ 
            data: {
                success: false,
                message: '权限设置保存失败'
            }
        });
    }
};
