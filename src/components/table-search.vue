<template>
	<div class="search-container">
		<el-form ref="searchRef" :model="query" :inline="true">
			<el-form-item :label="item.label" :prop="item.prop" v-for="item in options">
				<!-- 文本框、下拉框、日期框 -->
				<el-input v-if="item.type === 'input'" v-model="query[item.prop]" :disabled="item.disabled"
					:placeholder="item.placeholder || '请输入' + item.label" clearable @change="onInputChange"></el-input>
				<el-select v-else-if="item.type === 'select'" v-model="query[item.prop]" :disabled="item.disabled"
					:placeholder="item.placeholder || '请选择' + item.label" clearable @change="onSelectChange" class="select-field">
					<template v-if="item.opts">
						<el-option v-for="opt in item.opts" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
					</template>
					<template v-else-if="item.options">
						<el-option v-for="opt in item.options" :key="opt.value" :label="opt.label" :value="opt.value"></el-option>
					</template>
				</el-select>
				<el-date-picker v-else-if="item.type === 'date'" 
					v-model="query[item.prop]" 
					type="date" 
					:placeholder="item.placeholder || '选择日期'"
					:value-format="item.format || 'YYYY-MM-DD'" 
					:disabled="item.disabled"
					:style="{ width: '100%' }"
					@change="(val) => onDateChange(val, item.prop)">
				</el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" :icon="Search" @click="search">搜索</el-button>
				<el-button :icon="Refresh" @click="resetForm(searchRef)">重置</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { FormInstance } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import { PropType, ref, watch } from 'vue';
import { FormOptionList } from '@/types/form-option';

const props = defineProps({
	query: {
		type: Object,
		required: true
	},
	options: {
		type: Array as PropType<Array<FormOptionList>>,
		required: true
	},
	search: {
		type: Function,
		default: () => { }
	}
});

const searchRef = ref<FormInstance>();
const resetForm = (formEl: FormInstance | undefined) => {
	if (!formEl) return
	formEl.resetFields()
	props.search();
}

// 添加值变化的处理函数
const onInputChange = (value: string) => {
	console.log('输入框值变化:', value);
	props.search();
}

const onSelectChange = (value: string) => {
	console.log('下拉框值变化:', value);
	// 确保值被正确设置后再搜索
	setTimeout(() => {
		props.search();
	}, 100);
}

const onDateChange = (value: string | null, prop: string) => {
	console.log('日期选择器值变化:', prop, value);
	// 确保日期值正确设置
	if (value === null) {
		props.query[prop] = '';
	}
	
	// 添加日期验证，确保结束日期不早于开始日期
	if (prop === 'endDate' && props.query['startDate'] && value) {
		const startDate = new Date(props.query['startDate']);
		const endDate = new Date(value);
		
		startDate.setHours(0, 0, 0, 0); // 设置为当天开始时间
		endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
		
		if (endDate < startDate) {
			console.warn('结束日期早于开始日期，将调整为与开始日期相同');
			props.query[prop] = props.query['startDate'];
		}
	}
	
	// 延迟执行搜索以确保值已更新
	setTimeout(() => {
		props.search();
	}, 100);
}
</script>

<style scoped>
.search-container {
	padding: 20px 30px 0;
	background-color: #fff;
	margin-bottom: 10px;
	border: 1px solid #ddd;
	border-radius: 5px
}

.select-field {
	min-width: 140px;
	width: 100%;
}

:deep(.el-select__wrapper) {
	width: 100%;
}

:deep(.el-select .el-input__inner) {
	text-align: left;
	padding-right: 30px;
}

:deep(.el-select .el-input__suffix) {
	right: 5px;
}

:deep(.el-date-editor.el-input) {
	width: 100%;
}

:deep(.el-date-editor .el-input__wrapper) {
	width: 100%;
}

:deep(.el-date-editor .el-input__inner) {
	text-align: left;
}
</style>
