<template>
	<div class="order-list-container">
		<TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
		<div class="container">
			<TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
				:delFunc="handleDelete" :editFunc="handleEdit" :refresh="getData" :currentPage="page.index"
				:changePage="changePage">
				<template #toolbarBtn>
					<el-button type="warning" :icon="CirclePlusFilled" v-if="isManagerOrAdmin" @click="handleAdd">新增订单</el-button>
				</template>
				<template #amount="{ rows }">
					￥{{ rows.amount }}
				</template>
				<template #payStatus="{ rows }">
					<el-tag :type="getPayStatusType(rows.payStatus)">
						{{ rows.payStatus }}
					</el-tag>
				</template>
				<template #createdAt="{ rows }">
					{{ formatDate(rows.createdAt) }}
				</template>
				<template #operator="{ rows }">
					<div class="operation-buttons">
						<el-button type="warning" size="small" v-if="isManagerOrAdmin" @click="handleView(rows)">查看</el-button>
						<el-button type="primary" size="small" v-if="isManagerOrAdmin" @click="handleEdit(rows)">编辑</el-button>
						<el-button type="danger" size="small" v-if="isAdmin" @click="handleDelete(rows)">删除</el-button>
					</div>
				</template>
			</TableCustom>

		</div>
		<el-dialog :title="isEdit ? '编辑订单' : '新增订单'" v-model="visible" width="700px" destroy-on-close
			:close-on-click-modal="false" @close="closeDialog">
			<TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData">
			</TableEdit>
		</el-dialog>
		<el-dialog title="订单详情" v-model="visible1" width="700px" destroy-on-close>
			<TableDetail :data="viewData">
			</TableDetail>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="orderList">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CirclePlusFilled, View, Edit, Delete } from '@element-plus/icons-vue';
import { fetchOrderList, fetchOrderDetail, updateOrderStatus, deleteOrder, createOrder } from '@/api/order';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import TableEdit from '@/components/table-edit.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

// 获取当前用户角色
const userRole = localStorage.getItem('vuems_role') || 'user';
const isAdmin = computed(() => userRole === 'admin');
const isManagerOrAdmin = computed(() => userRole === 'admin' || userRole === 'manager');

// 格式化日期的函数
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
};

// 获取支付状态类型
const getPayStatusType = (status: string): string => {
	switch (status) {
		case '已支付':
			return 'success';
		case '未支付':
			return 'warning';
		case '已取消':
			return 'danger';
		default:
			return 'info';
	}
};

// 查询相关
const query = reactive({
	companyName: '',
	payStatus: '',
	startDate: '',
	endDate: ''
});

const searchOpt = ref<FormOptionList[]>([
	{ type: 'input', label: '公司名称：', prop: 'companyName' },
	{
		type: 'select', label: '支付状态：', prop: 'payStatus', opts: [
			{ label: '全部', value: '' },
			{ label: '未支付', value: '未支付' },
			{ label: '已支付', value: '已支付' },
			{ label: '已取消', value: '已取消' }
		]
	},
	{ type: 'date', label: '开始日期：', prop: 'startDate', format: 'YYYY-MM-DD' },
	{ type: 'date', label: '结束日期：', prop: 'endDate', format: 'YYYY-MM-DD' }
]);

const handleSearch = () => {
	changePage(1);
};

// 表格相关
let columns = ref([
	{ type: 'selection', width: 40 },
	{ type: 'index', label: '序号', width: 60, align: 'center' },
	{ prop: 'companyName', label: '公司名称', width: 180 },
	{ prop: 'legalPerson', label: '法人代表', width: 90 },
	{ prop: 'registrationCode', label: '统一社会信用代码', width: 180 },
	{ prop: 'amount', label: '金额', width: 90, visible: true },
	{ prop: 'orderType', label: '订单类型', width: 100 },
	{ prop: 'payStatus', label: '支付状态', width: 90, visible: true },
	{ prop: 'createdAt', label: '创建时间', width: 150, visible: true },
	{ prop: 'operator', label: '操作', width: 180, visible: true, fixed: 'right' },
]);

const page = reactive({
	index: 1,
	size: 10,
	total: 0,
});

const tableData = ref([]);
const getData = async () => {
	try {
		console.log('获取订单数据');
		
		// 添加分页参数
		const params = {
			...query,
			page: page.index,
			limit: page.size
		};
		
		// 直接调用API获取所有订单数据
		const res = await fetchOrderList(params);
		console.log('订单数据响应:', res);
		
		if (res.data && res.data.success) {
			// 直接使用返回的数据
			const orders = res.data.data.orders || [];
			const total = res.data.data.total || 0;
			
			tableData.value = orders;
			page.total = total;
			console.log('获取到订单数据:', tableData.value);
		} else {
			const message = res.data && res.data.message ? res.data.message : '获取订单列表失败';
			console.error('获取订单失败:', message);
			ElMessage.error(message);
			tableData.value = [];
			page.total = 0;
		}
	} catch (error) {
		console.error('获取订单列表出错:', error);
		ElMessage.error('获取订单列表失败');
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
let options = ref<FormOption>({
	labelWidth: '150px',
	span: 24,
	list: [
		{ type: 'input', label: '公司名称', prop: 'companyName', required: true },
		{ type: 'input', label: '法人代表', prop: 'legalPerson' },
		{ type: 'input', label: '统一社会信用代码', prop: 'registrationCode' },
		{ type: 'number', label: '金额', prop: 'amount', required: true },
		{
			type: 'select', label: '订单类型', prop: 'orderType', required: true, options: [
				{ label: '公司注册', value: '公司注册' },
				{ label: '公司变更', value: '公司变更' },
				{ label: '代理记账', value: '代理记账' },
				{ label: '税务咨询', value: '税务咨询' },
				{ label: '其他服务', value: '其他服务' },
				{ label: '执照年报', value: '执照年报' },
				{ label: '执照作废', value: '执照作废' },
			]
		},
		{
			type: 'select', label: '支付状态', prop: 'payStatus', required: true, options: [
				{ label: '未支付', value: '未支付' },
				{ label: '已支付', value: '已支付' },
				{ label: '已取消', value: '已取消' },
			]
		},
	]
});

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref({});
const handleEdit = (row: any) => {
	rowData.value = { ...row };
	isEdit.value = true;
	visible.value = true;
};

// 添加一个新订单
const handleAdd = () => {
	rowData.value = {
		companyName: '',
		legalPerson: '',
		registrationCode: '',
		amount: 0,
		orderType: '公司注册',
		payStatus: '未支付'
	};
	isEdit.value = false;
	visible.value = true;
};

const updateData = async (formData: any) => {
	try {
		if (isEdit.value) {
			// 更新现有订单
			const res = await updateOrderStatus(formData.id, formData);
			if (res.data && res.data.success) {
				ElMessage.success('订单更新成功');
				closeDialog();
				getData();
			} else {
				ElMessage.error(res.data?.message || '订单更新失败');
			}
		} else {
			// 创建新订单
			const res = await createOrder(formData);
			if (res.data && res.data.success) {
				ElMessage.success('订单创建成功');
				closeDialog();
				getData();
			} else {
				ElMessage.error(res.data?.message || '订单创建失败');
			}
		}
	} catch (error) {
		console.error('操作订单数据失败:', error);
		ElMessage.error('操作失败，请重试');
	}
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
	list: []
});

const handleView = async (row: any) => {
	try {
		const res = await fetchOrderDetail(row.id);
		if (res.data.success) {
			viewData.value.row = res.data.data;
			viewData.value.list = [
				{
					prop: 'id',
					label: '订单ID',
				},
				{
					prop: 'companyName',
					label: '公司名称',
				},
				{
					prop: 'legalPerson',
					label: '法人代表',
				},
				{
					prop: 'registrationCode',
					label: '统一社会信用代码',
				},
				{
					prop: 'amount',
					label: '金额',
				},
				{
					prop: 'orderType',
					label: '订单类型',
				},
				{
					prop: 'payStatus',
					label: '支付状态',
				},
				{
					prop: 'createdAt',
					label: '创建时间',
					formatter: formatDate
				},
				{
					prop: 'updatedAt',
					label: '更新时间',
					formatter: formatDate
				}
			];
			visible1.value = true;
		} else {
			ElMessage.error(res.data.message || '获取订单详情失败');
		}
	} catch (error) {
		console.error('获取订单详情出错:', error);
		ElMessage.error('获取订单详情失败');
	}
};

// 删除相关
const handleDelete = async (row: any) => {
	try {
		// 提示用户确认删除
		await ElMessageBox.confirm(
			`确定要删除订单 "${row.companyName}" 吗？此操作不可恢复！`,
			'删除确认',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}
		);
		
		// 执行删除操作
		const result = await deleteOrder(row.id);
		if (result.data.success) {
			ElMessage.success('删除成功');
			getData();
		} else {
			ElMessage.error(result.data.message || '删除失败');
		}
	} catch (error: any) {
		// 特殊处理401未授权错误
		if (error.response && error.response.status === 401) {
			ElMessage.error('您没有权限执行此操作，请使用管理员账号登录');
			// 可以选择性地跳转到登录页面
			// router.push('/login');
		} else if (error === 'cancel') {
			// 用户取消了删除操作
			console.log('用户取消了删除');
		} else {
			console.error('删除订单出错:', error);
			ElMessage.error(error.message || '删除失败');
		}
	}
};

// 修改订单处理函数
const handleSave = async (formData: any) => {
	try {
		const orderId = formData.id;
		
		// 调用API更新订单
		const result = await updateOrderStatus(orderId, formData);
		
		if (result.data.success) {
			ElMessage.success('更新成功');
			closeDialog();
			getData();
		} else {
			ElMessage.error(result.data.message || '更新失败');
		}
	} catch (error: any) {
		// 特殊处理401未授权错误
		if (error.response && error.response.status === 401) {
			ElMessage.error('您没有权限执行此操作，请使用管理员账号登录');
			// 可以选择性地跳转到登录页面
			// router.push('/login');
		} else {
			console.error('更新订单出错:', error);
			ElMessage.error(error.message || '更新失败');
		}
	}
};
</script>

<style scoped>
.order-list-container {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.container {
	padding: 20px;
	background-color: #fff;
	border-radius: 5px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	width: 100%;
	flex: 1;
	overflow: auto;
	box-sizing: border-box;
}

.operation-buttons {
	display: flex;
	justify-content: center;
	gap: 5px;
}

.operation-buttons .el-button {
	padding: 4px 8px;
	font-size: 12px;
}

:deep(.el-button--small) {
	padding: 5px 8px;
	height: 28px;
	line-height: 16px;
}

:deep(.el-table) {
	width: 100% !important;
}

:deep(.el-table__header) {
	width: 100% !important;
}

:deep(.el-table__body) {
	width: 100% !important;
}

:deep(.el-table .cell) {
	padding-left: 10px;
	padding-right: 10px;
}

:deep(.el-table--border .el-table__cell) {
	border-right: 1px solid #EBEEF5;
}
</style> 