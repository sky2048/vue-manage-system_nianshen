<template>
	<el-config-provider :locale="zhCn" :message="messageConfig">
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { useThemeStore } from './store/theme';

// 配置消息通知，将提示框往下放并居中
const messageConfig = {
	max: 3, // 最多显示3个消息
	offset: 150, // 距离顶部的偏移量，单位px
	position: 'top-center', // 居中显示
	grouping: true, // 相同内容的消息合并
	duration: 3000 // 显示时间，单位ms
};

const theme = useThemeStore();
theme.initTheme();
</script>
<style>
@import './assets/css/main.css';
</style>
