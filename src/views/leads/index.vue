<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" v-if="Component" />
    <template v-else>
      <div class="node-conatiner">
        <!-- Title Page -->
        <h2 class="nc_title font18">Danh sách khách hàng</h2>

        <!-- import file -->

        <div class="import-wrapper">
          <a-card title="Import Leads from Excel" class="mb16">
            <div class="actions">
              <a-button type="default" @click="downloadTemplate" :loading="downloadingTemplate">
                Tải mẫu Excel
              </a-button>

              <a-upload :beforeUpload="beforeUpload" :customRequest="uploadRequest" :showUploadList="false"
                accept=".xls,.xlsx">
                <a-button type="primary" class="ml8">
                  Chọn file & Import
                </a-button>
              </a-upload>
            </div>

            <div class="note mt12">
              <div>Gợi ý: sử dụng mẫu tải về, giữ header và định dạng ngày yyyy-MM-dd hoặc ngày hợp lệ.</div>
              <div class="text-muted">Hệ thống sẽ thông báo số bản ghi tạo mới, bỏ qua và danh sách lỗi (nếu có).</div>
            </div>
          </a-card>

          <a-modal v-model:open="resultModalVisible" title="Kết quả import" :footer="null" width="720px">
            <div>
              <p><strong>Created:</strong> {{ importResult.created }}</p>
              <p><strong>Skipped:</strong> {{ importResult.skipped }}</p>

              <div v-if="importResult.errors?.length">
                <p><strong>Errors:</strong></p>
                <a-list :dataSource="importResult.errors" :renderItem="(item) => h('a-list-item', item)" bordered
                  style="max-height:320px;overflow:auto" />
                <div class="mt12">
                  <a-button size="small" @click="copyErrors">Copy lỗi</a-button>
                  <a-button size="small" class="ml8" @click="downloadErrors">Tải lỗi</a-button>
                </div>
              </div>

              <div v-else>
                <p>Không có lỗi.</p>
              </div>
            </div>
          </a-modal>
        </div>

        <!-- Table & table filter  -->
        <Table ref="ELRef" rowKey="leadId" :url="LeadApi.getAll" :columns="columns" :items="tableFilterItems"
          :button="tableFilterButton" :actions="tableActions" :model="tableFilterModel" @onDeleteAll="handleDeleteAll"
          :buttons="tableActionButtons" :scroll="{ x: 700 }" />


      </div>


    </template>
  </router-view>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue';
import { columns } from './constant';
import { AppsApi, ImportResult, LeadApi } from '@/apis';
import { message } from 'ant-design-vue';
import { useMessage } from '@/hooks/useMessage';
import { useUserStore } from '@/store/user';

const downloadingTemplate = ref(false);
const uploading = ref(false);
const resultModalVisible = ref(false);
const importResult = reactive<ImportResult>({ created: 0, skipped: 0, errors: [] as string[] });

const router = useRouter();
const { createConfirm } = useMessage();
const ELRef = ref<{ refresh: () => void, onDeselect: () => void }>();
const refresh = () => ELRef.value?.refresh();

const { userName } = useUserStore();

const tableActions = reactive([
  {
    label: 'Edit',
    type: 'custom',
    iconCustom: 'EditOutlined',
    onClick: (row: any) => {
      router.push(`/lead/${row?.leadId}/edit`);
    },
  },
  {
    label: 'Delete',
    type: 'custom',
    iconCustom: 'DeleteOutlined',
    popConfirm: {
      title: 'Are you sure to delete?',
      onConfirm: async (row: any) => {
        try {
          const res = await LeadApi.remove(row?.leadId);
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
          refresh();
        }
      },
      onCancel: () => {

      }
    },
  },
  {
    label: 'Tạo hồ sơ YCBH',
    type: 'custom',
    iconCustom: 'UserOutlined',
    onClick: async (row: any) => {
      console.log('tạo hồ sơ', row);
      try {
        if (row && row.leadId) {
          const resq = await AppsApi.create({
            leadId: row.leadId,
            createdBy: userName || undefined,
          })
          message.success('Tạo hồ sơ thành công', 5)
          router.push('/lead')
        }
      }
      catch (err) {
        console.error(err);
      }
      finally {

      }
    },
  },
]);

// filter
const tableFilterModel = reactive({ q: null });
const tableFilterButton = reactive({
  type: 'primary',
  label: 'Tạo mới',
  onClick: () => {
    router.push('/lead/create');
  },
});

// actions button
const tableActionButtons = computed(() => [
  // {
  //   type: 'dashed',
  //   label: 'Download Template Excel',
  //   onClick: downloadTemplate,
  // }
]);

const downloadTemplate = async () => {
  try {
    downloadingTemplate.value = true;
    const resp = await LeadApi.downloadTemplate();
    const blob = new Blob([resp.data], { type: resp.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // try to read filename from headers
    const disposition = resp.headers['content-disposition'];
    let filename = `leads-template.xlsx`;
    if (disposition) {
      const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?(.*?)"?(;|$)/i);
      if (match) filename = decodeURIComponent(match[1] || match[2] || filename);
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    message.success('Template downloaded');
  } catch (err) {
    message.error('Tải template thất bại');
  } finally {
    downloadingTemplate.value = false;
  }
}

// validate file before upload
const beforeUpload = (file: File) => {
  const isExcel = /\.xlsx?$/.test(file.name.toLowerCase());
  if (!isExcel) {
    message.error('Vui lòng chọn file Excel (.xls hoặc .xlsx)');
    return false;
  }
  const maxMB = 10;
  if (file.size / 1024 / 1024 > maxMB) {
    message.error(`Kích thước file phải nhỏ hơn ${maxMB}MB`);
    return false;
  }
  return true;
};

// custom upload -> call API import
const uploadRequest = async (options: any) => {
  // options.file is the File object
  const file = options.file as File;
  uploading.value = true;
  try {
    const data = await LeadApi.importExcel(file);

    // Expecting ImportResultDto { Created, Skipped, Errors }
    importResult.created = data.created ?? 0;
    importResult.skipped = data.skipped ?? 0;
    importResult.errors = data.errors ?? [];

    resultModalVisible.value = true;
    message.success('Import hoàn tất');
    options.onSuccess?.(data);
  } catch (err: any) {
    console.error('upload', err);
    message.error(err?.response?.data ?? 'Import thất bại');
    options.onError?.(err);
  } finally {
    uploading.value = false;
    options.onComplete?.();
    refresh();
  }
};

// download errors as text file
const downloadErrors = () => {
  if (!importResult.errors || importResult.errors.length === 0) {
    message.info('No errors to download');
    return;
  }
  const blob = new Blob([importResult.errors.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `import-errors_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// copy errors to clipboard
const copyErrors = async () => {
  if (!importResult.errors || importResult.errors.length === 0) {
    message.info('No errors to copy');
    return;
  }
  try {
    const txt = importResult.errors.join('\n');
    await navigator.clipboard.writeText(txt);
    message.success('Copied to clipboard');
  } catch {
    message.error('Copy failed');
  }
};

const tableFilterItems = computed(() => [
  {
    type: 'search',
    name: 'q',
    placeholder: 'Tìm theo tên/Mst/Số định danh/Số điện thoại',
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

</script>
<style lang="less" scoped>
.node-conatiner {
  .nc_title {
    margin-top: 6px;
    margin-bottom: 30px;
  }
}
</style>
