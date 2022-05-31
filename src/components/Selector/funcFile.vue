<template>

  <el-select
    v-model="tempFuncFiles"
    multiple
    filterable
    default-first-option
    clearable
    size="mini"
    style="width:100%"
    placeholder="请选择函数文件"
    class="filter-item">
    <el-option
      v-for="funcFile in funcFilesList"
      :key="funcFile.id"
      :label="funcFile.name"
      :value="funcFile.id"
    ></el-option>
  </el-select>

</template>

<script>

import {funcFileList} from '@/apis/apiTest/funcFile'

export default {
  name: 'funcFile',
  props: [
      'currentFuncFileList',
      'funcFiles'
  ],
  mounted() {
    this.funcFilesList = this.currentFuncFileList
    if (!this.currentFuncFileList){
      this.getFuncFileList()
    }
  },
  created() {
    this.tempFuncFiles = this.funcFiles
  },
  data() {
    return {
      funcFilesList: [],  // 自定义函数列表
      tempFuncFiles: []  // 选中的自定义函数列表
    }
  },
  methods: {

    // 获取自定义函数列表
    getFuncFileList() {
      funcFileList().then(response => {
        this.funcFilesList = response.data.data
      })
    }
  },
  watch: {
    'funcFiles': {
      handler(newVal, oldVal) {
        this.tempFuncFiles = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
