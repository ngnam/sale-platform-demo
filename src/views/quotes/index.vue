<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" v-if="Component" />
    <template v-else>
      <div class="node-conatiner">
        <!-- Title Page -->
        <h2 class="nc_title font18">Danh sách báo giá</h2>

        <!-- Table & table filter  -->
        <Table ref="ELRef" rowKey="appId" :url="QuoteApi.getAll" :columns="columns" :items="tableFilterItems"
          :actions="tableActions" :model="tableFilterModel" @onDeleteAll="handleDeleteAll"
          :scroll="{ x: 700 }" />

      </div>
    </template>
  </router-view>
</template>

<script setup lang="ts">
import { columns } from './constant';
import { AppsApi, LeadApi, QuoteApi } from '@/apis';
import { message } from 'ant-design-vue';
import { useMessage } from '@/hooks/useMessage';

const router = useRouter();
const { createConfirm } = useMessage();
const ELRef = ref<{ refresh: () => void, onDeselect: () => void }>();

const tableActions = reactive([
  // {
  //   label: 'Edit',
  //   type: 'custom',
  //   iconCustom: 'EditOutlined',
  //   onClick: (row: any) => {
  //     router.push(`/quotes/${row?.appId}/edit`);
  //   },
  // },
  {
    label: 'Delete',
    type: 'custom',
    iconCustom: 'DeleteOutlined',
    popConfirm: {
      title: 'Are you sure to delete?',
      onConfirm: async (row: any) => {
         try {
          const res = await QuoteApi.remove(row?.quoteId);
          if (res) {
            console.log('Delete successful:', res);
            const { createMessage } = useMessage();
            createMessage.success(res?.data?.message || 'Deleted successfully');
          } else {
            // Xử lý lỗi từ response không thành công
            console.error('Delete failed:', res);
          }
        } catch (error: any) {
          console.log('Lỗi khi gọi Delete:', error?.response);
        } finally {
          ELRef.value?.refresh();
        }
      },
      onCancel: () => {

      }
    },
  },
]);

// filter
const tableFilterModel = reactive({ appId: null, leadId: null });
const tableFilterButton = reactive({
  type: 'primary',
  label: 'Tạo mới',
  onClick: () => {
    router.push('/quotes/create');
  },
});

const tableFilterItems = computed(() => [
  {
    type: 'search',
    name: 'appId',
    placeholder: 'Tìm mã hồ sơ YCBH',
    disabled: true
  },
  {
    type: 'lazyselect',
    name: 'leadId',
    placeholder: 'Chọn khách hàng',
    pageSize: 10,
    fetchApiUsers: fetchLead,
    labelKey: 'fullName',
    valueKey: 'leadId',
    allowClear: true,
  },
  {
    type: 'lazyselect',
    name: 'appId',
    placeholder: 'Chọn hồ sơ YCBH',
    pageSize: 10,
    fetchApiUsers: fetchApp,
    labelKey: 'appId',
    valueKey: 'appId',
    allowClear: true,
  }
]);

const handleDeleteAll = async (data: any) => {
  if (!data || data.length == 0) { return; }
  createConfirm({
    title: 'Xoá tất cả hồ sơ đã chọn',
    content: 'Are you sure to delete?',
    iconType: 'warning',
    onOk() {
      message.info('Đang phát triển');
    },
  });
}

const fetchApp = async (query: any, page: number, pageSize: number) => {
  const res = await AppsApi.getAll({ page: page, pageSize: pageSize, leadId: tableFilterModel.leadId || undefined })
  return res.items;
}

const fetchLead = async (query: any, page: number, pageSize: number) => {
  const res = await LeadApi.getAll({ page: page, pageSize: pageSize, leadId: query })
  return res.items;
}

</script>
<style lang="less" scoped>
.node-conatiner {
  .nc_title {
    margin-top: 6px;
    margin-bottom: 30px;
  }
}
</style>
