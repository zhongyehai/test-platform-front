<template>
  <el-select
      ref="projectSelectorView"
      v-model="tempProjectId"
      placeholder="请选择服务"
      size="mini"
      style="min-width: 100%"
      filterable
      default-first-option
      :disabled="isDisabled"
      @change="choiceProject"
  >
    <el-option v-for="(item) in projectLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>

import {projectList} from '@/apis/apiTest/project'

export default {
  name: "project",
  props: [
    'projectId',
    'isDisabled',
    'busOnEventName',
    'busEmitEventName'
  ],
  data() {
    return {
      tempProjectId: '',
      projectLists: '',
    }
  },
  methods: {

    // 获取服务列表
    getProjectList() {
      projectList().then(response => {
        this.projectLists = response.data.data
      })
    },

    // 遍历服务列表，获取对应id的服务信息
    getProjectFromProjectList(projectId) {
      for (let index in this.projectLists) {
        if (this.projectLists[index]['id'] === projectId) {
          return this.projectLists[index]
        }
      }
    },

    // 通过bus发送选中的服务
    choiceProject(projectId) {
      if (this.busEmitEventName) {
        this.$bus.$emit(this.busEmitEventName, this.getProjectFromProjectList(projectId))
      }
    }
  },

  created() {
    // 把初始的父组件传进来的 projectId 传给bus
    if (this.busEmitEventName) {
      this.$bus.$emit(this.busEmitEventName, this.getProjectFromProjectList(this.projectId))
    }
    this.getProjectList()
  },

}
</script>

<style scoped>

</style>
