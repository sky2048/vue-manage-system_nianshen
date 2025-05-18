import { defineStore } from 'pinia';

interface ObjectList {
    [key: string]: string[];
}

export const usePermissStore = defineStore('permiss', {
    state: () => {
        // 定义最基础的默认权限，所有角色只有系统首页权限
        const defaultList: ObjectList = {
            admin: [
                '0',  // 系统首页
                '1',  // 系统管理
                '11', // 用户管理
                '12', // 角色管理
                '13', // 菜单管理
                '2',  // 组件
                '21', '22', '23', '24', '25', '26', '27', '28', '29', '291', '292',
                '3',  // 表格
                '31', '32', '33', '34',
                '4',  // 图表
                '41', '42',
                '5',  // 图标
                '7',  // 主题
                '6',  // 附加页面
                '61', '62', '63', '64', '65', '66',
                '9',  // 订单管理
                '91', // 订单列表
                '92', // 订单统计
            ],
            manager: [
                '0',  // 系统首页
                '9',  // 订单管理
                '91', // 订单列表
                '92', // 订单统计
            ],
            user: [
                '0',  // 系统首页
                '9',  // 订单管理
                '91', // 订单列表
            ],
        };

        const role = localStorage.getItem('vuems_role') || 'user';
        console.log('当前用户角色:', role);
        
        // 优先从localStorage中读取权限配置
        let savedKeys: string[] = [];
        try {
            const keysStr = localStorage.getItem('ms_keys');
            if (keysStr) {
                savedKeys = JSON.parse(keysStr);
                console.log('从localStorage加载用户自定义权限配置:', savedKeys);
            }
        } catch (e) {
            console.error('读取本地权限配置失败:', e);
        }
        
        // 从localStorage中获取角色配置信息
        try {
            const roleDataStr = localStorage.getItem('mock_role_data');
            if (roleDataStr) {
                const roleData = JSON.parse(roleDataStr);
                // 查找当前用户角色的配置
                const currentRoleConfig = roleData.find((r: any) => r.key === role);
                if (currentRoleConfig && Array.isArray(currentRoleConfig.permiss)) {
                    // 使用角色配置中的权限
                    console.log(`从角色数据中获取到${role}角色的权限配置:`, currentRoleConfig.permiss);
                    savedKeys = currentRoleConfig.permiss;
                }
            }
        } catch (e) {
            console.error('从角色数据中读取权限配置失败:', e);
        }
        
        // 如果localStorage中有权限配置，则使用；否则使用默认配置
        const initialKeys = savedKeys.length > 0 
            ? savedKeys 
            : (role === 'admin' 
                ? defaultList.admin 
                : role === 'manager' 
                    ? defaultList.manager 
                    : defaultList.user);
        
        console.log('最终初始化权限配置:', initialKeys);
        
        return {
            key: initialKeys as string[],
            defaultList,
        };
    },
    actions: {
        handleSet(val: string[]) {
            if (!val || !Array.isArray(val)) {
                console.error('设置权限失败：无效的权限数据', val);
                return;
            }
            
            console.log('更新权限状态，新权限:', val);
            this.key = val;
            
            // 保存权限配置到localStorage
            localStorage.setItem('ms_keys', JSON.stringify(val));
            console.log('权限配置已更新并保存到localStorage');
        },
    },
});
