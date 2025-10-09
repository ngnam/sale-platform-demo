<template>
  <component v-if="AntdIconComponent" :is="AntdIconComponent" :style="iconStyle" :class="iconClass" />
  <icon-font v-else :style="iconStyle" :class="iconClass" :type="iconType" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import * as AntdIcons from '@ant-design/icons-vue';
import { createFromIconfontCN } from '@ant-design/icons-vue';
// iconfontUrl
const ICONFONTURL = '/iconfont/iconfont-custom.js';

const IconFont = createFromIconfontCN({
  scriptUrl: ICONFONTURL,
});

export default defineComponent({
  components: {
    IconFont,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
    align: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '18px',
    },
  },
  setup(props) {
    // Convert type to PascalCase and append 'Outlined' if not present
    const getIconName = (type: string) => {
      let name = type;
      if (!/Outlined$/.test(name)) {
        name = name.charAt(0).toUpperCase() + name.slice(1) + 'Outlined';
      }
      return name;
    };

    const AntdIconComponent = computed(() => {
      const iconName = getIconName(props.type);
      return (AntdIcons as any)[iconName] || null;
    });

    const iconType = computed(
      () => `icon-a-SimpleChainlianmenglianjichubantubiao_${props.type}`
    );

    const iconClass = computed(() =>
      props.className ? `my-icon ${props.className}` : 'my-icon'
    );

    const iconStyle = computed(() => {
      const style: Record<string, string> = {};
      if (props.align) style['vertical-align'] = props.align;
      if (props.size) style['font-size'] = props.size;
      return style;
    });

    return {
      AntdIconComponent,
      iconType,
      iconClass,
      iconStyle,
    };
  },
});
</script>
<style scoped>
.my-icon {
  font-size: 18px;
  vertical-align: middle;
  fill: currentColor;
}
</style>