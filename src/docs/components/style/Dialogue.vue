<!-- 对话组件 -->

<script lang="ts">
import { computed } from "vue";
import { getRoleColors } from "./roles";

export default {
  props: {
    role: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const roleColors = computed(() => {
      const { color, background } = getRoleColors(props.role);
      return [color, background];
    });

    return { roleColors };
  },
};
</script>
<template>
  <div
    class="my-6 relative pl-6 font-bold before:content-['“'] before:text-(--main-color-1) before:text-[2.50rem] before:leading-none before:absolute before:-top-2 before:left-0"
  >
    <span
      class="inline-block py-1 px-2 rounded text-[0.80rem] font-bold mr-2"
      :style="{ color: roleColors[0], background: roleColors[1] }"
      >{{ role }}</span
    >
    <slot></slot>
  </div>
</template>
