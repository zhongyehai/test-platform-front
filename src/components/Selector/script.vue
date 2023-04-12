<template>

  <el-select
    v-model="tempScriptList"
    multiple
    filterable
    default-first-option
    clearable
    size="mini"
    :style="selectStyle"
    placeholder="请选择函数文件"
    class="filter-item"
  >
    <el-option
      v-for="script in scriptListData"
      :key="script.id"
      :label="script.name"
      :value="script.id"
    />
  </el-select>

</template>

<script>

import { scriptList } from '@/apis/assist/script'

export default {
  name: 'FuncFile',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'currentScriptListData',
    // eslint-disable-next-line vue/require-prop-types
    'scriptList',
    // eslint-disable-next-line vue/require-prop-types
    'cite'
  ],

  data() {
    return {
      scriptListData: [], // 自定义函数列表
      tempScriptList: [], // 选中的自定义函数列表
      selectStyle: {
        width: '98%'
      }
    }
  },
  watch: {
    'scriptList': {
      handler(newVal, oldVal) {
        this.tempScriptList = newVal
      }
    }
  },

  mounted() {
    this.scriptListData = this.currentScriptListData
    if (!this.currentScriptListData) {
      this.getFuncFileList()
    }
  },

  created() {
    if (this.cite && this.cite === 'case') {
      this.selectStyle = {
        width: '95%'
      }
    }
    this.tempScriptList = this.scriptList
  },
  methods: {

    // 获取自定义函数列表
    getFuncFileList() {
      scriptList().then(response => {
        this.scriptListData = response.data.data
      })
    }
  }
}
</script>

<style scoped>

</style>
