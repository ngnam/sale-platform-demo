<!-- src/layouts/MainLayout.vue -->
<template>
    <a-layout style="min-height:100vh">
        <a-layout-sider collapsible v-model:collapsed="collapsed" breakpoint="lg" :collapsed-width="50" :width="250"
            theme="dark">
            <div class="logo" :class="collapsed ? 'collapse' : ''"><span v-if="!collapsed">{{ username }}</span></div>
            <a-menu theme="dark" mode="inline" :selectedKeys="[activeKey]"  :openKeys="openKeys" @openChange="onOpenChange">
                <a-menu-item key="dashboard" :class="{ active: activeKey === 'dashboard' }" @click="to('/')">
                    <template #icon>
                        <dashboard-outlined />
                    </template>
                    <span v-if="!collapsed">Dashboard</span>
                </a-menu-item>

                <a-menu-item key="lead" :class="{ active: activeKey === 'lead' }" @click="to('/lead')">
                    <template #icon>
                        <user-outlined />
                    </template>
                    <span v-if="!collapsed">Thông tin khách hàng</span>
                </a-menu-item>

                <a-menu-item key="apps" :class="{ active: activeKey === 'apps' }" @click="to('/apps')">
                    <template #icon>
                        <FileTextOutlined />
                    </template>
                    <span v-if="!collapsed">Hồ sơ YCBH</span>
                </a-menu-item>

                <a-menu-item key="quotes" :class="{ active: activeKey === 'quotes' }" @click="to('/quotes')">
                    <template #icon>
                        <FileTextOutlined />
                    </template>
                    <span v-if="!collapsed">Danh sách báo giá</span>
                </a-menu-item>

                <a-menu-item key="illustration" :class="{ active: activeKey === 'illustration' }"
                    @click="to('/illustration')">
                    <template #icon>
                        <file-text-outlined />
                    </template>
                    <span v-if="!collapsed">Bảng minh hoạ</span>
                </a-menu-item>

                <!-- Master Data menu -->
                <a-sub-menu key="master-data">
                    <template #icon>
                        <database-outlined />
                    </template>
                    <template #title>
                        <span v-if="!collapsed">Master Data</span>
                    </template>

                    <a-menu-item key="productPlan"
                        :class="{ active: activeKey === 'productPlan' }"
                        @click="to('/master/product-plan')">
                        <template #icon>
                            <SettingOutlined />
                        </template>
                        Sản phẩm bảo hiểm
                    </a-menu-item>

                    <a-menu-item key="term-rate" :class="{ active: activeKey === 'term-rate' }"
                        @click="to('/master/term-rate')">
                        <template #icon>
                            <SettingOutlined />
                        </template>
                        Bảng Term Rate
                    </a-menu-item>

                    <a-menu-item key="rider-master" :class="{ active: activeKey === 'rider-master' }"
                        @click="to('/master/rider-master')">
                        <template #icon>
                            <SettingOutlined />
                        </template>
                        Quản lý Phụ trợ bảo hiểm
                    </a-menu-item>

                    <a-menu-item key="rider-rate" :class="{ active: activeKey === 'rider-rate' }"
                        @click="to('/master/rider-rate')">
                        <template #icon>
                            <SettingOutlined />
                        </template>
                        Cấu hình Tỷ lệ Rider
                    </a-menu-item>
                </a-sub-menu>

            </a-menu>
        </a-layout-sider>

        <a-layout>
            <a-layout-header class="header">
                <div class="header-left">
                    <h3 class="page-title" v-if="title">{{ title }}</h3>
                </div>
                <div class="header-right">
                    <a-button type="text" @click="onLogout">Logout</a-button>
                </div>
            </a-layout-header>

            <a-layout-content style="margin:24px">
                <a-breadcrumb v-if="showBreadcrumb" style="margin-bottom:16px">
                    <a-breadcrumb-item>
                        <router-link to="/">Home</router-link>
                    </a-breadcrumb-item>
                    <a-breadcrumb-item v-if="backToRouter">
                        <router-link :to="backToRouterPath">{{ breadcrumbParentTitle }}</router-link>
                    </a-breadcrumb-item>
                    <a-breadcrumb-item>{{ breadcrumbTitle }}</a-breadcrumb-item>
                </a-breadcrumb>

                <router-view />
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined
} from '@ant-design/icons-vue';
import { useUserStore } from '@/store/user';
import { Key } from 'ant-design-vue/es/_util/type';

const collapsed = ref(false);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const username = computed(() => userStore.userName);

// allow user to open/close submenus manually
function onOpenChange(keys: Key[]) {
  openKeys.value = keys;
}

const to = (path: string) => {
    router.push(path);
};

const activeKey = computed(() => {
    // choose route name or path-based mapping to keys
    const name = route.name ? String(route.name) : route.path;
    // map several possible route names/paths to menu keys
    if (name.includes('lead')) return 'lead';
    if (name.includes('apps')) return 'apps';
    if (name.includes('quotes')) return 'quotes';
    if (name.includes('illustration') || name.includes('ilustration')) return 'illustration';
    if (name.includes('productPlan') || name.includes('PlanVersions') || name.includes('PricingVersions') || name.includes('ProductBenefits') || name.includes('ProductBenefitDetail')) return 'productPlan';
    if (name.includes('productBenefit')) return 'productBenefit';
    if (name.includes('benefitScaleEntry')) return 'benefitScaleEntry';
    if (name.includes('term-rate') || name.includes('TermRateSeed')) return 'term-rate';
    if (name.includes('rider-master')) return 'rider-master';
    if (name.includes('rider-rate')) return 'rider-rate';

    return 'dashboard';
});

const openKeys = ref<string[] | Key[]>(['master-data']);

// page title and breadcrumb (example reactive values)
const title = computed(() => {
  return (route.meta?.title as string) || '';
});

// breadcrumb visibility
const showBreadcrumb = computed(() => {
  return Boolean(route.meta?.bread);
});
// breadcrumb current title
const breadcrumbTitle = computed(() => {
  return (route.meta?.title as string) || '';
});

// support backToRouter meta: can be route name or path string
const backToRouter = computed(() => {
  return route.meta?.backToRouter as string | undefined;
});

// resolve backToRouterPath and parent title
const backToRouterPath = computed(() => {
  if (!backToRouter.value) return '';
  // if backToRouter is a route name, find its path; otherwise treat as path
  const targetName = backToRouter.value;
  const found = router.getRoutes().find(r => r.name === targetName);
  if (found && found.path) return found.path;
  return String(backToRouter.value);
});

// optional display label for parent breadcrumb item
const breadcrumbParentTitle = computed(() => {
  if (!backToRouter.value) return '';
  const targetName = backToRouter.value;
  const found = router.getRoutes().find(r => r.name === targetName);
  if (found && found.meta && found.meta.title) return String(found.meta.title);
  // fallback capitalize or show provided value
  return String(backToRouter.value);
});

const onLogout = () => {
    userStore.logout();
    router.push({ name: 'Login' });
};

// ensure master-data opens when activeKey belongs to its items
watch(activeKey, (val) => {
  const masterItems = ['productPlan', 'term-rate', /* add other master keys here */];
  if (masterItems.includes(String(val))) {
    if (!openKeys.value.includes('master-data')) openKeys.value = ['master-data'];
  } else {
    // close master submenu when selecting other top-level keys
    openKeys.value = openKeys.value.filter(k => k !== 'master-data');
  }
  console.log('openKeys', openKeys)
});

// register icon components locally
const dashboardOutlined = DashboardOutlined;
const userOutlined = UserOutlined;
const fileTextOutlined = FileTextOutlined;
</script>

<style scoped>
.logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    background: url('/logo_bg.png') top center / contain no-repeat;
    position: relative;
    background-color: #fff;
}

.logo.collapse {
    width: 50px;
    background: url('/logo_bg_collapse.png') center center / contain no-repeat;
    background-color: #fff;
}

.logo>span {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 11px;
    background-color: red;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 0 16px;
}

.page-title {
    margin: 0;
}

a-menu-item.active {
    background-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
