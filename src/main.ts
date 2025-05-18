import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import { usePermissStore } from './store/permiss';
import 'element-plus/dist/index.css';
import './assets/css/icon.css';
import { ElConfigProvider } from 'element-plus';

// 在app.vue中添加配置提供者，需要先删除这里的全局配置代码
// ElMessage的配置将在App.vue中设置

const app = createApp(App);
app.use(createPinia());
app.use(router);

// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
// 自定义权限指令
const permiss = usePermissStore();
app.directive('permiss', {
    mounted(el, binding) {
        if (!binding.value) return;
        
        // 检查菜单项ID是否在用户权限中
        const hasPermission = permiss.key.includes(String(binding.value));
        
        if (!hasPermission) {
            // 移除元素而不是简单地隐藏
            el.parentNode && el.parentNode.removeChild(el);
        }
    },
});

app.mount('#app');
