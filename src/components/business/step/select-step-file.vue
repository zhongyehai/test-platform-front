<template>
  <el-dialog
      title="选择文件"
      v-model="selectDialogIsShow"
      :close-on-click-modal="false"
      width="70%"
  >

    <el-scrollbar class="aside_scroll" :style="{height: `${scrollHeight}`}">
      <fileSelector :is-select-step-file="true"></fileSelector>
    </el-scrollbar>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="selectDialogIsShow = false">关闭</el-button>
    </div>

  </el-dialog>
</template>

<script lang="ts" setup>

import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import fileSelector from '@/views/assist/files/index.vue'
import {bus, busEvent} from "@/utils/bus-events";

const selectDialogIsShow = ref(false)

const scrollHeight = computed(() =>{
  if (innerHeight < 800){  // 小屏
    return `${innerHeight * 0.85}px`
  }else {  // 大屏
    return `${innerHeight * 0.7}px`
  }
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawer);
  bus.on(busEvent.drawerIsCommit, onDrawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawer);
  bus.off(busEvent.drawerIsCommit, onDrawerIsCommit);
})

const onShowDrawer = (message: any) => {
  if (message.eventType === 'select-step-file') {
    selectDialogIsShow.value = true
  }
}

const onDrawerIsCommit = (message: any) => {
  if (message.eventType === 'select-step-file') {
    selectDialogIsShow.value = false
  }
}

</script>


<style scoped lang="scss">

</style>
