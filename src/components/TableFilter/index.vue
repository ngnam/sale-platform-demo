<template>
  <a-card v-if="!hasHidden" :body-style="{ marginBottom: '5px', padding: '24px 24px 0 24px'}" :bordered="false">
    <a-form class="form-container" layout="horizontal" :model="formModel">
      <a-row type="flex">
        <a-col flex="100px">
          <a-space>
            <template v-for="item in getItems" :key="item.name">
              <a-form-item :name="item.name">
                <a-select v-if="item.type === 'select'" :key="`select-${item.name}`" v-bind="item"
                  v-model:value="formModel[item.name]" class="default-select-w" />
                <a-date-picker v-else-if="item.type === 'date'" :key="`date-${item.name}`" v-bind="item"
                  v-model:value="formModel[item.name]" class="default-select-w" />
                <a-checkbox v-else-if="item.type === 'checkbox'" :key="`checkbox-${item.name}`" v-bind="item"
                  v-model:checked="formModel[item.name]" class="default-select-w">
                  {{ formModel[item.name] ? 'Active' : 'Inactive' }}
                </a-checkbox>
                <LazySelect v-else-if="item.type === 'lazyselect'" :key="`lazyselect-${item.name}`"
                  v-model="formModel[item.name]" v-bind="item" class="default-select-w" />
                <a-input-search v-else v-bind="item" :key="`input-${item.name}`" v-model:value="formModel[item.name]"
                  @search="handleSubmit" class="default-search-w">
                  <template #enterButton>
                    <a-button type="primary">Search</a-button>
                  </template>
                </a-input-search>
              </a-form-item>
            </template>
          </a-space>
        </a-col>
        <a-col flex="auto" v-if="selectedRowKeys.length > 0" class="rowS">
          <span style="margin-left: 16px; font-weight:600;">
            {{ `${selectedRowKeys.length} Selected` }}
          </span>
          <span style="margin-left: 8px; margin-right: 8px"
            :style="{ 'text-decoration': 'underline', color: '#0065BD', fontWeight: 600 }"
            @click="handleDeselect">Deselect</span>
          <a-button style="margin-left: 8px;" type="primary" danger @click="handleDeleteAll">{{
            "Delete"
            }}</a-button>
        </a-col>
        <a-col v-if="button || buttons" flex="auto" class="rowE" style="gap: 5px">         

          <span class="text" v-if="button.type === 'text'">{{ button.label }}</span>
          <!-- <a-button v-else v-bind="button" v-auth="button.auth" @click="button?.onClick">{{
            button.label
          }}</a-button> -->
          <a-button v-if="getButton.permission" v-bind="button" @click="button?.onClick">{{
            button.label
            }}</a-button>
          <a-button v-if="isExportExcel && getButton.permission" type="default" style="margin-left: 10px;"
            @click="handleExportExcel">Export to Excel</a-button>

          <template v-for="item in getButtons" :key="item.label">
            <a-button v-if="item" v-bind="item" @click="item?.onClick">{{ item.label }}</a-button>
          </template>

        </a-col>

      </a-row>
    </a-form>
  </a-card>
</template>
<script lang="ts">
export default defineComponent({
  props: ['hiddenFilter', 'button', 'items', 'model', 'rowSelection', 'isExportExcel', 'buttons'],
  emits: ['onSearch', 'onDeselect', 'onDeleteAll', 'onExportExcel'],

  setup(props, { emit }) {

    const formModel = reactive(props.model || {});

    const getItems = computed(() => {
      return (props.items || []).map((item: any) => {
        return {
          type: 'input',
          ...item,
        };
      });
    });

    const getButtons = computed(() => {
     return (props.buttons || []).map((item: any) => {
        return {
          type: 'default',
          ...item,
        };
      });
    })

    const handleSubmit = () => {
      emit('onSearch');
    };

    // onMounted(() => console.log(`hiddenFilter`, props.hiddenFilter));

    const hasHidden = ref(props.hiddenFilter);

    const selectedRowKeys = computed(() => props.rowSelection ? props.rowSelection.selectedRowKeys : []);

    watchEffect(() => {
      // 如果都不存在
      if (!props.button && !props.items) {
        hasHidden.value = true;
      }
    });

    const getButton = computed(() => {
      const plainObj = toRaw(props.button) || {};
      return {
        ...plainObj,
        permission: true,
      };
    });

    const handleDeselect = () => {
      emit('onDeselect');
    };

    const handleDeleteAll = () => {
      emit('onDeleteAll')
    }

    const handleExportExcel = () => {
      emit('onExportExcel')
    }
    return {
      formModel,
      getItems,
      getButtons,
      hasHidden,
      getButton,
      handleSubmit,
      selectedRowKeys,
      handleDeselect,
      handleDeleteAll,
      handleExportExcel
    };
  },
});
</script>
<style lang="less" scoped>
.form-container {
  .default-select-w {
    width: 250px;
  }

  .default-search-w {
    width: 300px;
  }

  .default-search-w :deep(.ant-select-arrow),
  .default-search-w :deep(.ant-select-clear) {
    margin-top: -10px !important;
  }

  // & :deep(.ant-input) {
  //   height: 36px;
  // }
  // & :deep(.ant-select) {
  //   height: 36px;
  // }
  // & :deep(.ant-btn) {
  //   height: 36px;
  // }
}

.text {
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
}
</style>
