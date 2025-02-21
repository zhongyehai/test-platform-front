<template>
  <el-config-provider :size="size">
    <router-view></router-view>
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'App',
  setup() {
    const store = useStore()
    const size = computed(() => store.state.app.elementSize)

    return {
      size,
    }
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  width: 100%;
  height: 100vh;
}

.app-container {
  padding: 5px;
}

.table-query-form {
  margin-top: 5px;

  .form-item {
    display: flex;
    align-items: center;
  }
}

/*
dialog上下左右在视口居中、内容高度过高过开启dialog内滚动（dialog最高100vh）
*/
.el-dialog {
  display: flex !important;
  flex-direction: column !important;
  margin: 0 !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  /*//overflow-y: scroll !important;*/
  max-height: 100vh !important;
}

/*
拖动排序的动效
*/
.drag-button {
  cursor: move;
  transition: transform 0.2s ease;
}

.drag-dragging {
  opacity: 0.5;
}

.el-table__row {
  transition: transform 0.3s ease; /* 表格行平滑过渡 */
}
</style>
