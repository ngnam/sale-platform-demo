<template>
  <router-view v-slot="{ route }">
    <div class="node-conatiner">
      <!-- Title Page -->
      <h2 class="nc_title font18">Tạo hồ sơ YCBH</h2>

      <a-button type="default" @click="onBack" :loading="isLoadding">Back</a-button>
    </div>
  </router-view>
</template>

<script setup lang="ts">
// import { useMessage } from '@/hooks/useMessage';
const router = useRouter();

// modal
const isLoadding = ref<boolean>(false);

const onBack = () => {
  router.push('/apps');
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
