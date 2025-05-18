<template>
    <div>
        <el-tree
            class="mgb10"
            ref="tree"
            :data="data"
            node-key="id"
            default-expand-all
            show-checkbox
            :default-checked-keys="checkedKeys"
        />
        <el-button type="primary" @click="onSubmit" :loading="loading">保存权限</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElTree, ElMessage } from 'element-plus';
import { menuData } from '@/components/menu';
import { updateRolePermission } from '@/api';

const props = defineProps({
    permissOptions: {
        type: Object,
        required: true,
    },
});

// 父组件传递的关闭对话框的方法
const emit = defineEmits(['update:permissions', 'close']);

const menuObj = ref({});
// const data = menuData.map((item) => {
//     if (item.children) {
//         menuObj.value[item.id] = item.children.map((sub) => sub.id);
//     }
//     return {
//         id: item.id,
//         label: item.title,
//         children: item.children?.map((child) => {
//             return {
//                 id: child.id,
//                 label: child.title,
//             };
//         }),
//     };
// });

const getTreeData = (data) => {
    return data.map((item) => {
        const obj: any = {
            id: item.id,
            label: item.title,
        };
        if (item.children) {
            menuObj.value[item.id] = item.children.map((sub) => sub.id);
            obj.children = getTreeData(item.children);
        }
        return obj;
    });
};
const data = getTreeData(menuData);
const checkData = (data: string[]) => {
    return data.filter((item) => {
        return !menuObj.value[item] || data.toString().includes(menuObj.value[item].toString());
    });
};
// 获取当前权限
const checkedKeys = ref<string[]>(checkData(props.permissOptions.permiss || []));

// 保存权限
const tree = ref<InstanceType<typeof ElTree>>();
const loading = ref(false);

const onSubmit = async () => {
    if (!tree.value) return;
    
    // 获取选中的权限
    const keys = [...tree.value.getCheckedKeys(false), ...tree.value.getHalfCheckedKeys()];
    console.log('选中的权限ID:', keys);
    
    loading.value = true;
    try {
        // 调用API更新角色权限
        const res = await updateRolePermission(props.permissOptions.id, keys as string[]);
        
        if (res.data && res.data.success) {
            ElMessage.success(res.data.message || '权限设置保存成功');
            
            // 通知父组件权限已更新
            emit('update:permissions', {
                id: props.permissOptions.id,
                permiss: keys
            });
            
            // 关闭对话框
            emit('close');
        } else {
            ElMessage.error(res.data?.message || '权限设置保存失败');
        }
    } catch (error) {
        console.error('保存权限出错:', error);
        ElMessage.error('保存权限失败');
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>
