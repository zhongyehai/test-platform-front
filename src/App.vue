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

    // 统一设定表格的高度
    const innerHeight = window.innerHeight
    if (innerHeight < 800){  // 小屏
      localStorage.setItem('tableHeight', `${innerHeight * 0.738}px`)
      localStorage.setItem('treeHeight', `${innerHeight * 0.67}px`)
    }else {  // 大屏
      localStorage.setItem('tableHeight', `${innerHeight * 0.86}px`)
      localStorage.setItem('treeHeight', `${innerHeight * 0.80}px`)
    }
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
  //text-align: center;
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
  //overflow-y: scroll !important;
  max-height: 100vh !important;
}

</style>
