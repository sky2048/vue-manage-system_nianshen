<template>
    <div class="dashboard-container">
        <div class="stats-row">
            <el-card shadow="hover" class="stat-card">
                <template #header>
                    <div class="card-header">
                        <span>今日订单数(单)</span>
                    </div>
                </template>
                <div class="card-value">{{ orderStats.todayOrderCount }}</div>
            </el-card>
            
            <el-card shadow="hover" class="stat-card">
                <template #header>
                    <div class="card-header">
                        <span>今日成交数(单)</span>
                    </div>
                </template>
                <div class="card-value">{{ orderStats.todayPaidOrderCount }}</div>
            </el-card>
            
            <el-card shadow="hover" class="stat-card">
                <template #header>
                    <div class="card-header">
                        <span>今日收入(元)</span>
                    </div>
                </template>
                <div class="card-value">{{ orderStats.todayIncome }}</div>
            </el-card>
        </div>

        <div class="chart-container">
            <h3 class="chart-title">本年度月度订单量趋势</h3>
            <div ref="chartRef" class="chart"></div>
        </div>
    </div>
</template>

<script setup lang="ts" name="dashboard">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchOrderStats, fetchOrderList } from '@/api/order';
import * as echarts from 'echarts';

// 统计数据
const orderStats = reactive({
    todayOrderCount: 0,
    todayPaidOrderCount: 0,
    todayIncome: 0
});

// 图表相关
const chartRef = ref<HTMLElement>();
let myChart: echarts.ECharts;

// 获取订单统计数据
const getOrderStats = async () => {
    try {
        const res = await fetchOrderStats();
        console.log('获取订单统计数据:', res);
        
        if (res.data && res.data.success) {
            const data = res.data.data;
            orderStats.todayOrderCount = data.todayOrderCount || 0;
            orderStats.todayPaidOrderCount = data.todayPaidOrderCount || 0;
            orderStats.todayIncome = data.todayIncome || 0;
            console.log('数据库统计数据:', orderStats);
        } else {
            ElMessage.error('获取订单统计数据失败');
        }
        
        // 获取月度订单数据
        getMonthlyOrderData();
    } catch (error) {
        console.error('获取订单统计数据出错:', error);
        ElMessage.error('获取订单统计数据出错');
    }
};

// 获取月度订单数据
const getMonthlyOrderData = async () => {
    try {
        // 计算当前年份的月度数据
        const currentYear = new Date().getFullYear();
        const monthlyData = Array(12).fill(0);
        
        // 获取所有订单数据
        const response = await fetchOrderList({ limit: 1000 }); // 获取足够多的订单以计算统计数据
        
        if (response.data && response.data.success) {
            const orders = response.data.data.orders;
            
            // 处理每个订单
            orders.forEach(order => {
                const orderDate = new Date(order.createdAt);
                // 确保只统计当前年份的订单
                if (orderDate.getFullYear() === currentYear) {
                    const month = orderDate.getMonth(); // 0-11
                    monthlyData[month]++;
                }
            });
            
            console.log('月度订单数据:', monthlyData);
            
            // 初始化图表
            initChart(monthlyData);
        } else {
            console.error('获取订单列表失败');
            // 使用默认数据初始化图表
            initChart([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }
    } catch (error) {
        console.error('获取月度订单数据出错:', error);
        // 使用默认数据初始化图表
        initChart([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
};

// 初始化图表
const initChart = (monthlyData) => {
    if (chartRef.value) {
        if (myChart) {
            myChart.dispose(); // 如果图表实例存在，先销毁
        }
        
        myChart = echarts.init(chartRef.value);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '30px',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    axisLine: {
                        lineStyle: {
                            color: '#999'
                        }
                    },
                    axisLabel: {
                        color: '#666',
                        fontSize: 12
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: '#DDD'
                        }
                    },
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: '#666',
                        fontSize: 12
                    }
                }
            ],
            series: [
                {
                    name: '订单量',
                    type: 'line',
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        width: 0
                    },
                    showSymbol: false,
                    areaStyle: {
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(128, 180, 244, 0.9)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(128, 180, 244, 0.3)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: monthlyData
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
.dashboard-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 20px;
    height: 150px;
}

.stat-card {
    flex: 1;
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    overflow: hidden;
}

.stat-card:first-child {
    margin-left: 0;
}

.stat-card:last-child {
    margin-right: 0;
}

.card-header {
    text-align: center;
    font-weight: bold;
    font-size: 16px;
}

.card-value {
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    color: #409EFF;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
}

.chart-container {
    flex: 1;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: 400px;
}

.chart-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin: 0 0 20px 0;
    color: #333;
}

.chart {
    width: 100%;
    flex: 1;
    min-height: 350px;
}

:deep(.el-card__header) {
    padding: 12px;
    background-color: #f5f7fa;
}

:deep(.el-card__body) {
    padding: 0;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
