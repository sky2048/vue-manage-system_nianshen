<template>
    <div class="wrapper">
        <v-header />
        <v-sidebar />
        <div class="content-box" :class="{ 'content-collapse': sidebar.collapse }">
            <v-tabs></v-tabs>
            <div class="content">
                <router-view v-slot="{ Component }">
                    <transition name="move" mode="out-in">
                        <keep-alive :include="tabs.nameList">
                            <component :is="Component"></component>
                        </keep-alive>
                    </transition>
                </router-view>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useSidebarStore } from '@/store/sidebar';
import { useTabsStore } from '@/store/tabs';
import vHeader from '@/components/header.vue';
import vSidebar from '@/components/sidebar.vue';
import vTabs from '@/components/tabs.vue';

const sidebar = useSidebarStore();
const tabs = useTabsStore();
</script>

<style>
.wrapper {
    height: 100vh;
    overflow: hidden;
}
.content-box {
    position: absolute;
    left: 250px;
    right: 0;
    top: 70px;
    bottom: 0;
    padding-bottom: 30px;
    -webkit-transition: left 0.3s ease-in-out;
    transition: left 0.3s ease-in-out;
    background: #eef0fc;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.content {
    width: 100%;
    height: 100%;
    padding: 20px;
    overflow-y: auto;
    box-sizing: border-box;
    flex: 1;
}

.content::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.content::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
    border-radius: 3px;
}

.content::-webkit-scrollbar-track {
    background-color: transparent;
}

.content-collapse {
    left: 65px;
}
</style>
