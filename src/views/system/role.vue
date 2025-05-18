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
                <template #status="{ rows }">
                    <span v-if="rows.status === 'active'">正常</span>
                    <span v-else>禁用</span>
                </template>
                <template #permissions="{ rows }">
                    <el-button type="primary" size="small" plain @click="handlePermission(rows)">管理</el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog :title="isEdit ? '编辑角色' : '新增角色'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog title="角色详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData">
                <template #status="{ rows }">
                    <span v-if="rows.status === 'active'">正常</span>
                    <span v-else>禁用</span>
                </template>
            </TableDetail>
        </el-dialog>
        <el-dialog title="权限管理" v-model="visible2" width="500px" destroy-on-close>
            <RolePermission 
                :permiss-options="permissOptions" 
                @update:permissions="handlePermissionUpdate"
                @close="closePermissionDialog"
            />
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-role">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Role } from '@/types/role';
import { fetchRoleData } from '@/api';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import RolePermission from './role-permission.vue'
import { CirclePlusFilled, Refresh } from '@element-plus/icons-vue';
import { FormOption, FormOptionList } from '@/types/form-option';

// 查询相关
const query = reactive({
    name: '',
    status: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '角色名称：', prop: 'name' },
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
])
const handleSearch = () => {
    changePage(1);
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '角色名称' },
    { prop: 'key', label: '角色标识' },
    { 
        prop: 'status', 
        label: '状态',
        formatter: (row: any) => {
            if (!row) return '禁用';
            return row.status === 'active' ? '正常' : '禁用';
        }
    },
    { prop: 'permissions', label: '权限管理' },
    { prop: 'operator', label: '操作', width: 250 },
])
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
})
const tableData = ref<Role[]>([]);
const getData = async () => {
    try {
        // 优先从localStorage中读取角色数据
        const localRoleData = localStorage.getItem('mock_role_data');
        if (localRoleData) {
            const parsedData = JSON.parse(localRoleData);
            // 将角色状态转换为与用户管理页面一致的格式
            tableData.value = parsedData.map((item: any) => ({
                ...item,
                status: item.status ? 'active' : 'inactive'
            }));
            page.total = parsedData.length;
            ElMessage.success('角色数据加载成功');
            return;
        }
        
        // 如果localStorage中没有数据，则从mock文件加载
        const res = await fetchRoleData();
        if (res.data && res.data.list) {
            // 将角色状态转换为与用户管理页面一致的格式
            const roles = res.data.list.map((item: any) => ({
                ...item,
                status: item.status ? 'active' : 'inactive'
            }));
            
            // 保存到localStorage
            localStorage.setItem('mock_role_data', JSON.stringify(res.data.list));
            
            tableData.value = roles;
            page.total = res.data.pageTotal || res.data.list.length;
            ElMessage.success('角色数据加载成功');
        } else {
            ElMessage.error('获取角色数据失败');
            tableData.value = [];
            page.total = 0;
        }
    } catch (error) {
        console.error('获取角色数据失败:', error);
        ElMessage.error('获取角色数据失败');
        tableData.value = [];
        page.total = 0;
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
const options = ref<FormOption>({
    labelWidth: '100px',
    span: 24,
    list: [
        { type: 'input', label: '角色名称', prop: 'name', required: true },
        { type: 'input', label: '角色标识', prop: 'key', required: true },
        {
            type: 'select',
            label: '状态',
            prop: 'status',
            required: true,
            opts: [
                { label: '正常', value: 'active' },
                { label: '禁用', value: 'inactive' }
            ]
        },
    ]
})
const visible = ref(false);
const isEdit = ref(false);
const rowData = ref({});

const handleAdd = () => {
    rowData.value = {
        name: '',
        key: '',
        status: 'active'
    };
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = (row: Role) => {
    rowData.value = { ...row };
    isEdit.value = true;
    visible.value = true;
};
const updateData = () => {
    // 在mock数据环境下，只需关闭对话框并显示成功消息
    ElMessage.success('操作成功');
    closeDialog();
    getData();
};
const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
    rowData.value = {};
};

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [],
    column: 1
});
const handleView = (row: Role) => {
    viewData.value.row = { ...row }
    viewData.value.list = [
        {
            prop: 'id',
            label: '角色ID',
        },
        {
            prop: 'name',
            label: '角色名称',
        },
        {
            prop: 'key',
            label: '角色标识',
        },
        {
            prop: 'status',
            label: '状态',
            formatter: (val: string) => val === 'active' ? '正常' : '禁用'
        },
    ]
    visible1.value = true;
};

// 删除相关
const handleDelete = (row: Role) => {
    ElMessageBox.confirm(
        `确定要删除角色 "${row.name}" 吗？`,
        '删除确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
    .then(() => {
        // 在mock数据环境下，直接显示成功消息
        ElMessage.success('删除成功');
        getData();
    })
    .catch(() => {
        ElMessage.info('已取消删除');
    });
}


// 权限管理弹窗相关
const visible2 = ref(false);
const permissOptions = ref({})
const handlePermission = (row: Role) => {
    visible2.value = true;
    permissOptions.value = {
        id: row.id,
        permiss: row.permiss || []
    };
};

// 处理权限更新
const handlePermissionUpdate = (data: any) => {
    // 更新本地数据
    const roleIndex = tableData.value.findIndex(role => role.id === data.id);
    if (roleIndex !== -1) {
        console.log(`更新本地角色数据, ID:${data.id}, 新权限:`, data.permiss);
        tableData.value[roleIndex].permiss = data.permiss;
    }
    
    // 关闭对话框
    visible2.value = false;
    
    // 刷新数据
    getData();
};

// 关闭权限对话框
const closePermissionDialog = () => {
    visible2.value = false;
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