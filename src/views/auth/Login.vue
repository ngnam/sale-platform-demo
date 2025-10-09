<template>
  <div class="login-page">
    <div class="login-bg" aria-hidden="true"></div>
    <div class="login-wrapper">
      <a-card class="login-card" title="Sign in">
        <a-form :model="form" :rules="rules" ref="formRef" @finish="onFinish" layout="vertical">
          <a-form-item name="username" label="Username">
            <a-input v-model:value="form.username" placeholder="Please enter username" @keyup.enter="submit" />
          </a-form-item>

          <a-form-item name="password" label="Password">
            <a-input-password v-model:value="form.password" placeholder="Please enter password" @keyup.enter="submit" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" block :loading="loading" @click="submit">
              Login
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import { useUserStore } from '@/store/user';
import { useRouter, useRoute } from 'vue-router';
import type { Rule } from 'ant-design-vue/es/form';

export default defineComponent({
  setup() {
    const form = reactive({ username: '', password: '' });
    const formRef = ref<FormInstance | null>(null);
    const loading = ref(false);
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();

    const rules: Record<string, Rule[]> = {
      username: [{ required: true, message: 'Please enter your username', trigger: 'blur' }],
      password: [{ required: true, message: 'Please enter your password', trigger: 'blur' }]
    };

    async function onFinish(values: any) {
      loading.value = true;
      try {
        await userStore.login(values);
        const redirect = (route.query.redirect as string) || '/';
        router.push(redirect);
      } catch (error: any) {
        console.error('Login error:', error);
        //message.error(error?.response?.data?.message || error?.message || 'Network error');
      } finally {
        loading.value = false;
      }
    }

    // Programmatic validate + submit
    async function submit() {
      if (!formRef.value) {
        // fallback to calling onFinish with current form
        await onFinish(form);
        return;
      }

      try {
        // validate returns Promise<void> when success, rejects on failure
        await formRef.value.validate();
        // validation passed — call onFinish with the reactive form object
        await onFinish({ ...form });
      } catch (err) {
        // validation failed — AntD will show errors automatically
      }
    }

    return { form, formRef, rules, onFinish, loading, submit };
  }
});
</script>

<style scoped>
.login-card {
  width: 360px;
  margin: 120px auto;
}
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* background layer */
.login-bg {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/login_bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(0.5px) brightness(0.85);
  z-index: 0;
}

/* wrapper so card sits above background */
.login-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

/* card style */
.login-card {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

/* responsive tweaks */
@media (max-width: 480px) {
  .login-wrapper { padding: 12px; max-width: 360px; }
  .login-card { padding: 12px; }
}
</style>
