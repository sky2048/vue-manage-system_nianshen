<template>
    <div class="order-stats-container">
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>今日订单数</span>
                        </div>
                    </template>
                    <div class="stat-value">{{ stats.todayOrderCount || 0 }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>今日收入（元）</span>
                        </div>
                    </template>
                    <div class="stat-value">{{ stats.todayIncome || 0 }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>总订单数</span>
                        </div>
                    </template>
                    <div class="stat-value">{{ stats.totalOrderCount || 0 }}</div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="stat-card">
                    <template #header>
                        <div class="card-header">
                            <span>总收入（元）</span>
                        </div>
                    </template>
                    <div class="stat-value">{{ stats.totalIncome || 0 }}</div>
                </el-card>
            </el-col>
        </el-row>

        <el-row style="margin-top: 20px;">
            <el-col :span="24">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>订单统计图表</span>
                        </div>
                    </template>
                    <div ref="chartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts" name="orderStats">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchOrderStats } from '@/api/order';
import * as echarts from 'echarts';

// 统计数据
const stats = reactive({
    todayOrderCount: 0,
    todayIncome: 0,
    totalOrderCount: 0,
    totalIncome: 0
});

// 图表相关
const chartRef = ref<HTMLElement>();
let myChart: echarts.ECharts;

// 获取订单统计数据
const getOrderStats = async () => {
    try {
        const res = await fetchOrderStats();
        console.log('获取订单统计数据:', res);
        
        if (res.data.success) {
            const data = res.data.data;
            stats.todayOrderCount = data.todayOrderCount || 0;
            stats.todayIncome = data.todayIncome || 0;
            stats.totalOrderCount = data.totalOrderCount || 0;
            stats.totalIncome = data.totalIncome || 0;
            
            // 初始化图表
            initChart();
        } else {
            ElMessage.error(res.data.message || '获取订单统计数据失败');
        }
    } catch (error) {
        console.error('获取订单统计数据出错:', error);
        ElMessage.error('获取订单统计数据失败');
    }
};

// 初始化图表
const initChart = () => {
    if (chartRef.value) {
        if (myChart) {
            myChart.dispose(); // 如果图表实例存在，先销毁
        }
        
        myChart = echarts.init(chartRef.value);
        
        // 格式化收入为两位小数
        const formatIncome = (value) => {
            return Number(value).toFixed(2);
        };
        
        const option = {
            title: {
                text: '订单统计数据',
                subtext: '今日vs总计',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let result = params[0].name + '<br/>';
                    params.forEach(param => {
                        let value = param.value;
                        if (param.seriesName === '收入') {
                            value = '¥' + formatIncome(value);
                        }
                        result += param.marker + ' ' + param.seriesName + ': ' + value + '<br/>';
                    });
                    return result;
                }
            },
            legend: {
                data: ['订单数', '收入'],
                bottom: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['今日', '总计'],
                axisLabel: {
                    fontSize: 14
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '订单数',
                    position: 'left',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                {
                    type: 'value',
                    name: '收入',
                    position: 'right',
                    axisLabel: {
                        formatter: '¥{value}'
                    }
                }
            ],
            series: [
                {
                    name: '订单数',
                    type: 'bar',
                    data: [stats.todayOrderCount, stats.totalOrderCount],
                    label: {
                        show: true,
                        position: 'top'
                    },
                    itemStyle: {
                        color: '#409EFF'
                    }
                },
                {
                    name: '收入',
                    type: 'bar',
                    yAxisIndex: 1,
                    data: [stats.todayIncome, stats.totalIncome],
                    label: {
                        show: true,
                        position: 'top',
                        formatter: function(params) {
                            return '¥' + formatIncome(params.value);
                        }
                    },
                    itemStyle: {
                        color: '#67C23A'
                    }
                }
            ]
        };
        
        myChart.setOption(option);
        window.addEventListener('resize', () => {
            myChart.resize();
        });
    }
};

onMounted(() => {
    getOrderStats();
});
</script>

<style scoped>
.order-stats-container {
    padding: 20px;
}

.stat-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
}

.stat-value {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    padding: 20px 0;
    color: #409EFF;
}

.chart {
    height: 400px;
    width: 100%;
}
</style> 