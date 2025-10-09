<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" v-if="Component" />
    <template v-else>
      <div class="node-conatiner">
        <!-- Title Page -->
        <h2 class="nc_title font18">Danh sách Hồ sơ YCBH</h2>

        <a-button type="default" style="margin-bottom: 5px;">
          <PhoneOutlined /> Ghi âm
        </a-button>

        <!-- Table & table filter  -->
        <Table ref="ELRef" rowKey="appId" :url="AppsApi.getAll" :columns="columns" :items="tableFilterItems"
          :actions="tableActions" :model="tableFilterModel" @onDeleteAll="handleDeleteAll"
          :scroll="{ x: 1200, y: 500 }" />

        <!-- modal tạo báo giá từ app -->

      </div>
    </template>
  </router-view>
</template>

<script setup lang="ts">
import { columns } from './constant';
import { AppsApi, LeadApi } from '@/apis';
import { message } from 'ant-design-vue';
import { useMessage } from '@/hooks/useMessage';

const router = useRouter();
const { createConfirm } = useMessage();
const ELRef = ref<{ refresh: () => void, onDeselect: () => void }>();
const refresh = () => ELRef.value?.refresh();

const tableActions = reactive([
  {
    label: 'Tạo báo giá',
    type: 'custom',
    iconCustom: 'EditOutlined',
    onClick: (row: any) => {
      router.push(`/quotes/create?appId=${row?.appId}`);
    },
  },
  {
    label: 'Delete',
    type: 'custom',
    iconCustom: 'DeleteOutlined',
    popConfirm: {
      title: 'Bạn chắc chắn muốn xoá hồ sơ YCBH này?',
      onConfirm: async (row: any) => {
        console.log(row)
        try {
          if (row && row.appId) {
            var resq = await AppsApi.remove(row.appId);
            console.log('delete success', resq);
            message.success(resq.message || 'Đã xoá hồ sơ YCBH này') 
            refresh();
          }
        }
        catch (err) {
          console.log('delete', err)
        }
        finally {

        }
      },
      onCancel: () => {

      }
    },
  },
]);

// filter
const tableFilterModel = reactive({ leadId: null });
const tableFilterButton = reactive({
  type: 'primary',
  label: 'Tạo mới',
  onClick: () => {

  },
});

const tableFilterItems = computed(() => [
  {
    type: 'search',
    name: 'leadId',
    placeholder: 'Tìm mã khách hàng',
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
