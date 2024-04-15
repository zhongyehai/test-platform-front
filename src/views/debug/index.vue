<template>
  <div style="margin: 50px">
    <component :is="iconComponent" :size="32" :theme="theme" style="color: red;"></component>
    <input v-model="iconName" placeholder="Enter icon name" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as icons from '@icon-park/vue-next';

const iconName = ref('Smile');
const theme = 'outline'; // 可选主题: 'outline', 'filled', 'two-tone', 'multi-color'

const iconComponent = computed(() => {
  const normalizedIconName = iconName.value.charAt(0).toUpperCase() + iconName.value.slice(1);
  return icons[normalizedIconName] || null;
});
</script>
