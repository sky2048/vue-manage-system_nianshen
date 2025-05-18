<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd">新增</el-button>
                    <el-button type="primary" :icon="Refresh" @click="getData">刷新</el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog :title="isEdit ? '编辑用户' : '新增用户'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog title="用户详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CirclePlusFilled, Refresh } from '@element-plus/icons-vue';
import { User } from '@/types/user';
import { fetchRealUserData, fetchUserById, updateUserData, deleteUserData, createUser } from '@/api';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import TableEdit from '@/components/table-edit.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

// 查询相关
const query = reactive({
    username: '',
    status: '',
});

const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '用户名：', prop: 'username' },
    { 
        type: 'select', 
        label: '状态：', 
        prop: 'status',
        options: [
            { label: '全部', value: '' },
            { label: '正常', value: 'active' },
            { label: '禁用', value: 'inactive' }
        ]
    }
]);

const handleSearch = () => {
    changePage(1);
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'username', label: '用户名' },
    { 
        prop: 'phone', 
        label: '手机号', 
        formatter: (val: any) => {
            return val || '未设置';
        }
    },
    { 
        prop: 'role', 
        label: '角色', 
        formatter: (val: string, row: any) => {
            // 处理角色格式化，使用完整行数据
            console.log(`角色值格式化: ${row?.username || 'unknown'}, 原始值:`, val);
            
            // 直接显示中文角色名称
            if (val === 'admin') return '管理员';
            if (val === 'manager') return '负责人';
            if (val === 'user') return '普通用户';
            
            // 其他情况统一显示为普通用户
            return '普通用户';
        }
    },
    { 
        prop: 'status', 
        label: '状态', 
        formatter: (val: string, row: any) => {
            // 处理状态格式化，使用完整行数据
            console.log(`状态值格式化: ${row?.username || 'unknown'}, 原始值:`, val);
            
            // 直接显示中文状态名称
            if (val === 'active') return '正常';
            if (val === 'inactive') return '禁用';
            
            // 其他情况统一显示为禁用
            return '禁用';
        } 
    },
    { 
        prop: 'createdAt', 
        label: '创建时间', 
        formatter: (val: string) => {
            return val ? formatDate(val) : '';
        } 
    },
    { prop: 'operator', label: '操作', width: 250 },
]);

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const page = reactive({
    index: 1,
    size: 10,
    total: 0,
});

const tableData = ref<User[]>([]);
const loading = ref(false);

const getData = async () => {
    loading.value = true;
    try {
        const res = await fetchRealUserData();
        console.log('原始获取到的用户数据:', res.data);
        
        // 处理来自后端API的标准响应格式
        if (res.data && res.data.success) {
            // 处理每个用户数据并添加详细日志
            tableData.value = (res.data.data || []).map((user: any) => {
                const processedUser = { ...user };
                console.log(`处理用户[${user.username}] - 原始角色:${user.role}, 状态:${user.status}`);
                
                // 强制标准化角色值
                if (user.role === 'admin' || user.role === '管理员') {
                    processedUser.role = 'admin';
                } else if (user.role === 'manager' || user.role === '负责人') {
                    processedUser.role = 'manager';
                } else {
                    processedUser.role = 'user';
                }
                
                // 强制标准化状态值
                if (user.status === 'active' || user.status === '正常' || user.status === '启用') {
                    processedUser.status = 'active';
                } else {
                    processedUser.status = 'inactive';
                }
                
                // 通用处理逻辑，确保数据格式正确
                if (processedUser.role === 'manager' && processedUser.status === 'active') {
                    console.log(`确认用户[${processedUser.username}]角色为manager，状态为active`);
                }
                
                console.log(`处理后[${processedUser.username}] - 角色:${processedUser.role}, 状态:${processedUser.status}`);
                return processedUser;
            });
            
            console.log('处理后的用户数据:', tableData.value);
            page.total = tableData.value.length;
            ElMessage.success('用户数据加载成功');
        } 
        // 处理来自mock数据的格式
        else if (res.data && res.data.list) {
            // 将mock数据中的名称字段映射到username
            tableData.value = res.data.list.map((item: any) => {
                const user = {
                    id: item.id,
                    username: item.name,
                    phone: item.phone,
                    role: item.role === '管理员' ? 'admin' : item.role === '负责人' ? 'manager' : 'user',
                    status: 'active',
                    createdAt: item.date
                };
                
                // 通用处理逻辑，确保数据格式正确
                if (user.role === 'manager' && user.status === 'active') {
                    console.log(`确认mock用户[${user.username}]角色为manager，状态为active`);
                }
                
                return user;
            });
            page.total = res.data.pageTotal || tableData.value.length;
            ElMessage.success('用户数据加载成功');
        } else {
            ElMessage.error('获取用户数据失败');
            tableData.value = [];
            page.total = 0;
        }
    } catch (error) {
        console.error('获取用户数据失败:', error);
        ElMessage.error('获取用户数据失败');
        tableData.value = [];
        page.total = 0;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getData();
});

const changePage = (val: number) => {
    page.index = val;
    getData();
};

// 新增/编辑弹窗相关
let options = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '用户名', prop: 'username', required: true },
        { type: 'input', label: '手机号', prop: 'phone', required: false },
        { type: 'input', label: '密码', prop: 'password', required: false, inputType: 'password' },
        {
            type: 'select',
            label: '角色',
            prop: 'role',
            required: true,
            opts: [
                { label: '管理员', value: 'admin' },
                { label: '负责人', value: 'manager' },
                { label: '普通用户', value: 'user' }
            ]
        },
        {
            type: 'select',
            label: '状态',
            prop: 'status',
            required: true,
            opts: [
                { label: '正常', value: 'active' },
                { label: '禁用', value: 'inactive' }
            ]
        }
    ]
});

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref({});

const handleAdd = () => {
    // 重置表单选项，使密码字段必填
    options.value.list.find(item => item.prop === 'password')!.required = true;
    options.value.list.find(item => item.prop === 'password')!.disabled = false;
    
    // 设置默认值并打印
    const defaultData = {
        username: '',
        password: '',
        phone: '',
        role: 'user',
        status: 'active'
    };
    
    console.log('新增用户默认数据:', defaultData);
    rowData.value = defaultData;
    
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = (row: User) => {
    // 设置密码字段为非必填且禁用
    const passwordField = options.value.list.find(item => item.prop === 'password');
    if (passwordField) {
        passwordField.required = false;
        passwordField.disabled = true;
    }
    
    // 创建一个不包含密码的用户对象副本
    const userCopy = { ...row };
    delete userCopy.password; // 确保不传入原始密码
    
    rowData.value = userCopy;
    isEdit.value = true;
    visible.value = true;
};

const updateData = async (formData: any) => {
    try {
        console.log('表单提交的原始数据:', formData);
        
        // 统一验证数据格式
        const validateForm = (data: any) => {
            // 验证用户名
            if (!data.username || data.username.trim() === '') {
                ElMessage.error('用户名不能为空');
                return false;
            }
            
            // 验证角色值
            if (data.role) {
                const validRoles = ['user', 'manager', 'admin'];
                const normalizedRole = String(data.role).trim();
                if (!validRoles.includes(normalizedRole)) {
                    ElMessage.error(`无效的角色值: ${data.role}，必须是 "user", "manager" 或 "admin"`);
                    return false;
                }
                // 标准化角色值
                data.role = normalizedRole;
            }
            
            // 验证状态值
            if (data.status) {
                const validStatuses = ['active', 'inactive'];
                const normalizedStatus = String(data.status).trim();
                if (!validStatuses.includes(normalizedStatus)) {
                    ElMessage.error(`无效的状态值: ${data.status}，必须是 "active" 或 "inactive"`);
                    return false;
                }
                // 标准化状态值
                data.status = normalizedStatus;
            }
            
            return true;
        };
        
        // 准备表单数据
        const prepareFormData = (data: any) => {
            const result = { ...data };
            
            // 移除undefined和null值
            Object.keys(result).forEach(key => {
                if (result[key] === undefined || result[key] === null) {
                    delete result[key];
                }
            });
            
            return result;
        };
        
        if (isEdit.value) {
            // 更新现有用户
            const updateFormData = prepareFormData(formData);
            
            // 如果密码为空，删除密码字段
            if (!updateFormData.password || updateFormData.password.trim() === '') {
                delete updateFormData.password;
            }
            
            // 验证表单数据
            if (!validateForm(updateFormData)) {
                return;
            }
            
            console.log('提交更新数据:', updateFormData);
            
            const res = await updateUserData(updateFormData.id, updateFormData);
            console.log('更新用户响应:', res.data);
            
            if (res.data && res.data.success) {
                ElMessage.success('用户更新成功');
                closeDialog();
                getData();
            } else {
                ElMessage.error(res.data?.message || '用户更新失败');
            }
        } else {
            // 添加新用户
            const newUserData = prepareFormData(formData);
            
            if (!newUserData.password || newUserData.password.trim() === '') {
                ElMessage.error('新增用户必须设置密码');
                return;
            }
            
            // 验证表单数据
            if (!validateForm(newUserData)) {
                return;
            }
            
            console.log('提交新增数据:', newUserData);
            
            const res = await createUser(newUserData);
            console.log('创建用户响应:', res.data);
            
            if (res.data && res.data.success) {
                ElMessage.success('用户添加成功');
                closeDialog();
                getData();
            } else {
                ElMessage.error(res.data?.message || '用户添加失败');
            }
        }
    } catch (error: any) {
        console.error('操作用户信息失败:', error);
        const errorMsg = error.details || error.message || '操作失败，请重试';
        ElMessage.error(errorMsg);
    }
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
};

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: []
});

const handleView = async (row: User) => {
    try {
        // 尝试从API获取详细信息
        const res = await fetchUserById(row.id);
        if (res.data && res.data.success) {
            viewData.value.row = { ...res.data.data };
            console.log('获取到的用户详情:', res.data.data);
        } else {
            viewData.value.row = { ...row };
            console.log('使用表格行数据作为详情:', row);
        }
    } catch (error) {
        console.error('获取用户详情失败:', error);
        viewData.value.row = { ...row };
    }

    viewData.value.list = [
        {
            prop: 'id',
            label: '用户ID',
        },
        {
            prop: 'username',
            label: '用户名',
        },
        {
            prop: 'phone',
            label: '手机号',
            formatter: (val: string) => val || '未设置'
        },
        {
            prop: 'role',
            label: '角色',
            formatter: (val: string, row: any) => {
                // 只在值存在时输出日志
                if (val) {
                    console.log('详情视图角色值:', val);
                }
                
                // 直接显示中文角色名称
                if (val === 'admin') return '管理员';
                if (val === 'manager') return '负责人';
                if (val === 'user') return '普通用户';
                
                // 其他情况统一显示为普通用户
                return '普通用户';
            }
        },
        {
            prop: 'status',
            label: '状态',
            formatter: (val: string, row: any) => {
                // 只在值存在时输出日志
                if (val) {
                    console.log('详情视图状态值:', val);
                }
                
                // 直接显示中文状态名称
                if (val === 'active') return '正常';
                if (val === 'inactive') return '禁用';
                
                // 其他情况统一显示为禁用
                return '禁用';
            }
        },
        {
            prop: 'createdAt',
            label: '创建时间',
            formatter: (val: string) => val ? formatDate(val) : ''
        },
        {
            prop: 'updatedAt',
            label: '更新时间',
            formatter: (val: string) => val ? formatDate(val) : ''
        },
    ];
    visible1.value = true;
};

// 删除相关
const handleDelete = (row: User) => {
    ElMessageBox.confirm(
        `确定要删除用户 "${row.username}" 吗？`,
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                const res = await deleteUserData(row.id);
                if (res.data && res.data.success) {
                    ElMessage.success('用户删除成功');
                } else {
                    ElMessage.error('用户删除失败');
                }
                getData();
            } catch (error) {
                console.error('删除用户失败:', error);
                ElMessage.error('删除用户失败');
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};
</script>

<style scoped>
.container {
    padding: 20px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>