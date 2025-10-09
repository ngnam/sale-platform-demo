<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" v-if="Component" />
    <template v-else>
      <div class="node-conatiner">
        <!-- Title Page -->
        <h2 class="nc_title font18">Bảng minh hoạ</h2>

        <!-- Table & table filter  -->
        <Table ref="ELRef" rowKey="illuId" :url="IllustrationApi.getAll" :columns="columns" :items="tableFilterItems"
           :actions="tableActions" :model="tableFilterModel" @onDeleteAll="handleDeleteAll"
          :scroll="{ x: 700 }" />

      </div>
    </template>
  </router-view>
</template>

<script setup lang="ts">
import { columns } from './constant';
import { IllustrationApi } from '@/apis';
import { message } from 'ant-design-vue';
import { useMessage } from '@/hooks/useMessage';

const router = useRouter();
const { createConfirm } = useMessage();
const ELRef = ref<{ refresh: () => void, onDeselect: () => void }>();

const tableActions = reactive([
  {
    label: 'Download',
    type: 'custom',
    iconCustom: 'DownloadOutlined',
    onClick: async (row: any) => {
     await downloadIllustration(row?.illuId);
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
          const res = await IllustrationApi.remove(row?.illuId);
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
const tableFilterModel = reactive({ q: null });
const tableFilterButton = reactive({
  type: 'primary',
  label: 'Tạo mới',
  onClick: () => {
    router.push('/illustration/create');
  },
});

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

const downloading = ref(false);

function parseFilenameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;
  const m: any = /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i.exec(cd);
  if (!m) return null;
  try { return decodeURIComponent(m[1].replace(/['"]/g, '')); } catch { return m[1].replace(/['"]/g, ''); }
}

async function downloadIllustration(illustrationId: string) {
  if (!illustrationId) { message.warn('No PDF'); return; }
  downloading.value = true;

  try {
    const resp = await IllustrationApi.getPdf(illustrationId);

    let blob: Blob;
    let filename = `illustration-${illustrationId}.pdf`;

    // axios-style response (has data and headers)
    if (resp && typeof resp === 'object' && 'data' in resp) {
      blob = resp.data instanceof Blob ? resp.data : new Blob([resp.data], { type: 'application/pdf' });
      const cd = (resp.headers && (resp.headers['content-disposition'] || resp.headers['Content-Disposition'])) ?? null;
      filename = parseFilenameFromContentDisposition(cd) ?? filename;
    } else {
      // assume fetch Response-like
      // if your IllustrationApi used fetch and returned Response, resp.blob exists
      if (resp && typeof (resp as any).blob === 'function') {
        blob = await (resp as Response).blob();
        const cd = (resp as Response).headers?.get?.('content-disposition') ?? null;
        filename = parseFilenameFromContentDisposition(cd) ?? filename;
      } else {
        // last resort: try to coerce resp to Blob
        blob = resp instanceof Blob ? resp : new Blob([JSON.stringify(resp)], { type: 'application/pdf' });
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    message.success('Download started');
  } catch (err: any) {
    console.error(err);
    message.error(err?.message ?? 'Download failed');
  } finally {
    downloading.value = false;
  }
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
