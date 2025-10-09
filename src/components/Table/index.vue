<template>
  <div class="table-component">
    <!-- filter -->
    <TableFilter :button="tableFilterButton" :items="tableFilterItems" :model="tableFilterModel"
      :hiddenFilter="hiddenFilter" :pagination="null" @onSearch="onSearch" @onDeselect="onDeselect"
      @onDeleteAll="onDeleteAll" :rowSelection="rowSelection" :isExportExcel="isExportExcel" :buttons="tableActionButtons"
      @onExportExcel="onExportExcel" />
    <!-- table -->

    <a-table :class="['ant-table-striped', { border: hasBordered }]"
      :rowClassName="(_: any, index: any) => (index % 2 === 1 ? 'table-striped' : '')" :dataSource="dataSource"
      :columns="columns" :rowKey="(record: any) => record[rowKey] || record.id" :pagination="pagination"
      :loading="loading || isLoadding" @change="handleTableChange" :scroll="scroll" :row-selection="rowSelection">
      <template #bodyCell="{ column, text, index, record }">
        <template v-if="column.key === 'toIndex'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-if="column.key === 'toDate'">
          <span>{{ text ? formatDate(text) : '-' }}</span>
        </template>
        <template v-if="column.key === 'toDateTime'">
          <span>{{ text ? formatDate(text, 'time') : '-' }}</span>
        </template>
        <template v-if="column.key === 'action'">
          <a-dropdown placement="topLeft">
            <template #overlay>
              <a-menu class="menu-box">
                <a-menu-item v-for="(action, index) in getActions" :key="`${index}-${action.label}`"
                  :style="{ 'color': [action.type === 'delete' ? 'red' : 'gray'] }">
                  <template #icon>
                    <Icon align="2px" size="15px" style="margin-right: 12px;" :type="getActionIcon(action, record)" />
                  </template>
                  <a-popconfirm placement="bottom" v-if="action.enable" :title="action?.title"
                    @confirm="action?.onConfirm(record)" @cancel="action?.onCancel(record)">
                    <a @click.prevent="() => { }" :type="action.type">{{ action.label }}</a>
                  </a-popconfirm>
                  <span v-else-if="!action.permission">——</span>
                  <a v-else @click="action?.onClick(record)" :type="action.type">{{ getActionLabel(action, record)
                    }}</a>
                </a-menu-item>
              </a-menu>
            </template>
            <Icon align="2px" size="20px" style="margin-left: 5px" type="EllipsisOutlined" />

          </a-dropdown>
        </template>
        <template v-if="column.key === 'open'">
          <Icon @click="openDetail(record)" align="2px" size="15px" style="margin-left: 5px" type="ExportOutlined" />
        </template>
      </template>
    </a-table>

  </div>
</template>
<script lang="ts">
import { FilterValue } from 'ant-design-vue/es/table/interface';
import dayjs from 'dayjs';
import { usePagination } from 'vue-request';
import { formatToDate, formatToDateTime } from '@/utils/dateUtil';
import { TablePaginationConfig } from 'ant-design-vue/lib/table/interface';

const router = useRouter();

export default defineComponent({
  props: [
    'bordered',
    'hiddenFilter',
    'url',
    'columns',
    'actions',
    'button',
    'items',
    'model',
    'resKey',
    'scroll',
    "rowSelection",
    "isExportExcel",
    "isLoadding",
    "rowKey",
    "buttons"
  ],
  // emits: ['onSearch'],
  emits: ['onDeleteAll', 'onExportExcel'],
  setup(props, { emit }) {
    const {
      data: dataSource,
      run,
      loading,
      current,
      pageSize,
      total,
      refresh,
    } = usePagination(props.url, {
      manual: false,
      pagination: {
        pageSizeKey: 'pageSize',
        currentKey: 'page',
        totalKey: 'totalItems',
        totalPageKey: 'totalPages',
      },
    });

    console.log(total)

    type Key = string | number;
    const selectedRowKeys = ref<Key[]>([]);
    const onSelectChange = (key: Key[]) => {
      selectedRowKeys.value = key;
    };

    const onDeselect = () => {
      selectedRowKeys.value = [];
    };

    const onDeleteAll = () => {
      emit('onDeleteAll', toRaw(rowSelection.value.selectedRowKeys))
    }

    const getActionLabel = (action: any, record: any) => {
      if (action.type === 'activate') {
        return !record.is_active ? 'Activate' : 'Deactivate';
      }
      return action.label;
    };

    const getActionIcon = (action: any, record: any) => {
      if (action.type === 'activate') {
        return record.is_active ? 'CheckOutlined' : 'CloseOutlined';
      }
      if (action.type === 'custom') {
        return action.iconCustom || 'EyeOutlined';
      }
      return action.type === 'edit' ? 'EditOutlined' : 'DeleteOutlined'
    };

    const rowSelection = computed(() => ({ selectedRowKeys: selectedRowKeys.value, onChange: onSelectChange }));

    const hasBordered = computed(() => props.bordered ?? true);

    const listData = computed(
      () => {
        console.log('listData', toRaw(dataSource.value))
        return (toRaw(dataSource.value) as unknown as Indexable)?.['items'] || []
      },
    );

    const pagination = computed(() => ({
      total: total.value,
      current: current.value,
      pageSize: pageSize.value,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: () => h('span', {}, `Total ${total.value} record`),
    }));

    const handleTableChange = (
      pag: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: any,
    ) => {
      run({
        pageSize: pag!.pageSize!,
        page: pag?.current,
        sort_by: sorter.field,
        order: sorter.order == undefined ? undefined : (sorter.order == 'descend' ? 'desc' : 'asc'),
        ...filters,
      });
    };

    // action 操作列
    const getActions = computed(() => {
      return (
        (toRaw(props.actions) || [])
          // .filter((action) => hasPermission(action.auth))
          .map((action: any) => {
            const { popConfirm } = action;
            return {
              type: 'link',
              ...action,
              // oxlint-disable-next-line no-useless-fallback-in-spread
              ...(popConfirm || {}),
              enable: !!popConfirm,
              permission: true //hasPermission(action.auth) && hasRole(action.role),
            };
          })
      );
    });

    // filter
    const tableFilterModel = computed(() => props.model);
    const tableFilterButton = computed(() => props.button);
    const tableFilterItems = computed(() => props.items);
    const tableActionButtons = computed(() => props.buttons);
    const onSearch = () => {
      const args = toRaw(tableFilterModel.value) || {};
      console.log('args', args);


      if (args) {
        Object.keys(args).map((key) => {
          if (args[key] && dayjs.isDayjs(args[key])) {
            args[key] = formatToDate(args[key]);
          }
        });
      }
      console.log('onSearch', { page: current.value, pageSize: pageSize.value, ...args });
      run({ page: current.value, pageSize: pageSize.value, ...args });
    };

    const formatDate = (val: string, type: 'date' | 'time' = 'date') => {
      if (val === '-') return '-'
      const formatFn = type === 'date' ? formatToDate : formatToDateTime;
      return val.length === 10 ? formatFn(Number(val) * 1000) : formatFn(val);
    };

    const openDetail = (record: any) => {
      console.log('record', record);
      // const keyword = record.keyword || record.name || record.title;
      const article = record.id;
      if (article) {
        router.push(`/app/articles/detail/${article}`);
      } else {
        console.warn('No article found in record:', record);
      }
    };
    const onExportExcel = () => {
      emit('onExportExcel')
    }

    return {
      dataSource: listData,
      loading,
      pagination,
      hasBordered,
      handleTableChange,
      run,
      refresh,
      getActions,
      // filter
      tableFilterModel,
      tableFilterButton,
      tableFilterItems,
      tableActionButtons,
      onSearch,
      formatDate,
      rowSelection,
      onDeselect,
      getActionLabel,
      getActionIcon,
      openDetail,
      onDeleteAll,
      onExportExcel
    };
  },
});
</script>
<style lang="less" scoped>
.ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}

.ant-table-striped :deep(.ant-table-pagination.ant-pagination) {
  margin: 30px auto;
  width: 100%;
  text-align: center;

  .ant-pagination-prev,
  .ant-pagination-next {
    .anticon {
      vertical-align: 1.5px;
    }
  }
}

.ant-table-striped :deep(.ant-pagination-item-active) {
  background: #0065BD;

  a {
    color: #ffffff;
  }
}

.border {
  border: 0.5px solid rgba(210, 210, 210, 0.5);
}
</style>
