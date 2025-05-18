<template>
    <div>
        <div class="table-toolbar" v-if="hasToolbar">
            <div class="table-toolbar-left">
                <slot name="toolbarBtn"></slot>
            </div>
            <div class="table-toolbar-right flex-center">
                <template v-if="multipleSelection.length > 0">
                    <el-tooltip effect="dark" content="删除选中" placement="top">
                        <el-icon class="columns-setting-icon" @click="delSelection(multipleSelection)">
                            <Delete />
                        </el-icon>
                    </el-tooltip>
                    <el-divider direction="vertical" />
                </template>
                <el-tooltip effect="dark" content="刷新" placement="top">
                    <el-icon class="columns-setting-icon" @click="refresh">
                        <Refresh />
                    </el-icon>
                </el-tooltip>
                <el-divider direction="vertical" />
                <el-tooltip effect="dark" content="列设置" placement="top">
                    <el-dropdown :hide-on-click="false" size="small" trigger="click">
                        <el-icon class="columns-setting-icon">
                            <Setting />
                        </el-icon>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="c in columns">
                                    <el-checkbox v-model="c.visible" :label="c.label" />
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip>
            </div>
        </div>
        <el-table class="mgb20" border :data="tableData" :row-key="rowKey"
            @selection-change="handleSelectionChange" table-layout="auto" stripe highlight-current-row>
            <template v-for="item in columns" :key="item.prop">
                <el-table-column v-if="item.visible" :prop="item.prop" :label="item.label" :width="item.width"
                    :type="item.type" :align="item.align || 'center'" :fixed="item.fixed">

                    <template #default="{ row, column, $index }" v-if="item.type === 'index'">
                        {{ getIndex($index) }}
                    </template>
                    <template #default="{ row, column, $index }" v-if="!item.type">
                        <slot :name="item.prop" :rows="row" :index="$index">
                            <template v-if="item.prop == 'operator'">
                                <div class="operation-btn-group">
                                    <el-button type="warning" size="small" @click="viewFunc(row)">查看</el-button>
                                    <el-button type="primary" size="small" @click="editFunc(row)">编辑</el-button>
                                    <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                                </div>
                            </template>
                            <span v-else-if="item.formatter">
                                {{ item.formatter(row[item.prop], row) }}
                            </span>
                            <span v-else>
                                {{ row[item.prop] }}
                            </span>
                        </slot>
                    </template>
                </el-table-column>
            </template>
        </el-table>
        <div class="pagination-container" v-if="hasPagination">
            <el-pagination :current-page="currentPage" :page-size="pageSize" :background="true"
                :layout="layout" :total="total" @current-change="handleCurrentChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRefs, PropType, ref } from 'vue'
import { Delete, Edit, View, Refresh } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const props = defineProps({
    // 表格相关
    tableData: {
        type: Array,
        default: []
    },
    columns: {
        type: Array as PropType<any[]>,
        default: []
    },
    rowKey: {
        type: String,
        default: 'id'
    },
    hasToolbar: {
        type: Boolean,
        default: true
    },
    //  分页相关
    hasPagination: {
        type: Boolean,
        default: true
    },
    total: {
        type: Number,
        default: 0
    },
    currentPage: {
        type: Number,
        default: 1
    },
    pageSize: {
        type: Number,
        default: 10
    },

    layout: {
        type: String,
        default: 'total, prev, pager, next'
    },
    delFunc: {
        type: Function,
        default: () => { }
    },
    viewFunc: {
        type: Function,
        default: () => { }
    },
    editFunc: {
        type: Function,
        default: () => { }
    },
    delSelection: {
        type: Function,
        default: () => { }
    },
    refresh: {
        type: Function,
        default: () => { }
    },
    changePage: {
        type: Function,
        default: () => { }
    }
})

let {
    tableData,
    columns,
    rowKey,
    hasToolbar,
    hasPagination,
    total,
    currentPage,
    pageSize,
    layout,
} = toRefs(props)

columns.value.forEach((item) => {
    if (item.visible === undefined) {
        item.visible = true
    }
})

// 当选择项发生变化时会触发该事件
const multipleSelection = ref([])
const handleSelectionChange = (selection: any[]) => {
    multipleSelection.value = selection
}

// 当前页码变化的事件
const handleCurrentChange = (val: number) => {
    props.changePage(val)
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning'
    })
        .then(async () => {
            props.delFunc(row);
        })
        .catch(() => { });
};

const getIndex = (index: number) => {
    return index + 1 + (currentPage.value - 1) * pageSize.value
}

</script>

<style scoped>
.table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 10px;
}

.columns-setting-icon {
    display: block;
    font-size: 18px;
    cursor: pointer;
    color: #676767;
}

.operation-btn-group {
    display: flex;
    justify-content: center;
    gap: 5px;
}

.operation-btn-group .el-button {
    padding: 4px 8px;
    font-size: 12px;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>
<style>
.table-header .cell {
    color: #333;
}

.el-table {
    width: 100% !important;
}

.el-table__body {
    width: 100% !important;
}

.el-table__header {
    width: 100% !important;
}

.el-table .el-table__cell {
    padding: 8px 0;
}

.el-table .cell {
    line-height: 1.5;
    padding: 0 10px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.el-table th.el-table__cell {
    background-color: #f5f7fa !important;
    color: #333;
    font-weight: bold;
    height: 45px;
}

.el-button--small {
    height: 28px;
    padding: 5px 8px;
    font-size: 12px;
    border-radius: 3px;
}
</style>