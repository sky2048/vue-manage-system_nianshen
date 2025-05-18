<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/logo.svg" alt="" />
                <div class="login-title">后台管理系统</div>
            </div>
            <el-form :model="param" :rules="rules" ref="register" size="large">
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="用户名">
                        <template #prepend>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="phone">
                    <el-input v-model="param.phone" placeholder="手机号">
                        <template #prepend>
                            <el-icon>
                                <Phone />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="密码"
                        v-model="param.password"
                        @keyup.enter="submitForm(register)"
                    >
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button class="login-btn" type="primary" size="large" @click="submitForm(register)">注册</el-button>
                <p class="login-text">
                    已有账号，<el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
                </p>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Register } from '@/types/user';
import { register as registerApi } from '@/api/auth';

const router = useRouter();
const param = reactive<Register>({
    username: '',
    password: '',
    phone: '',
});

const rules: FormRules = {
    username: [
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
        },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
};
const register = ref<FormInstance>();

// 添加一个辅助函数用于跳转到登录页
const redirectToLogin = () => {
    console.log('尝试跳转到登录页面');
    
    try {
        // 使用路由导航
        router.push('/login').catch(err => {
            console.error('路由跳转失败:', err);
            
            // 如果路由跳转失败，使用window.location作为备用方案
            setTimeout(() => {
                console.log('使用window.location作为备用跳转方式');
                window.location.href = '/#/login';
            }, 500);
        });
    } catch (e) {
        console.error('跳转出错:', e);
        // 使用最简单的方式跳转
        window.location.href = '/#/login';
    }
};

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.validate(async (valid: boolean) => {
        if (valid) {
            try {
                // 记录注册参数
                console.log('准备注册用户:', param);
                
                // 调用注册API
                const res = await registerApi(param);
                
                // 处理成功响应 - 包括200和201状态码
                console.log('注册响应:', res);
                
                // 检查是否有success标志或状态码是201
                if ((res.data && res.data.success) || res.status === 201) {
                    // 显示成功消息
                    ElMessage.success('注册成功，请登录');
                    
                    // 使用setTimeout确保消息显示后再跳转
                    setTimeout(() => {
                        console.log('注册成功，跳转到登录页面');
                        redirectToLogin();
                    }, 1000);
                } else {
                    console.log('注册失败(业务错误):', res.data);
                    ElMessage.error(res.data.message || '注册失败，请更换用户名');
                }
            } catch (error: any) {
                console.log('注册错误(HTTP错误):', error);
                
                // 特殊处理201错误 - 这种情况其实是成功的
                if (error.message === 'Created') {
                    console.log('注册实际上成功了，但被当作错误处理');
                    ElMessage.success('注册成功，请登录');
                    
                    // 使用setTimeout确保消息显示后再跳转
                    setTimeout(() => {
                        console.log('注册成功(从错误处理)，跳转到登录页面');
                        redirectToLogin();
                    }, 1000);
                    return;
                }
                
                // 获取更详细的错误信息
                if (error.response && error.response.data) {
                    console.log('错误详情:', error.response.data);
                    ElMessage.error(error.response.data.message || '注册失败，请更换用户名');
                } else {
                    ElMessage.error('注册失败，请更换用户名');
                }
            }
        } else {
            ElMessage.error('请输入完整的注册信息');
            return false;
        }
    });
};
</script>

<style scoped>
.login-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: url(../../assets/img/login-bg.jpg) center/cover no-repeat;
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
}

.logo {
    width: 35px;
}

.login-title {
    font-size: 22px;
    color: #333;
    font-weight: bold;
}

.login-container {
    width: 450px;
    border-radius: 5px;
    background: #fff;
    padding: 40px 50px 50px;
    box-sizing: border-box;
}

.login-btn {
    display: block;
    width: 100%;
}

.login-text {
    display: flex;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #787878;
}
</style>
