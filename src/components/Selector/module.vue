<template>
  <el-select
    v-model="tempModuleId"
    placeholder="请选择模块"
    size="mini"
    style="width: 100%"
    @change="clickModule"
    filterable
    default-first-option
  >
    <el-option v-for="(item) in tempModuleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>
import {moduleList} from "@/apis/apiTest/module";

export default {
  name: "module",
  props: [
    "moduleId",
    "projectId",
    "status",  // 编辑框的显示状态，显示编辑框时才请求模块列表
    'busOnEventName',
    'busOnModuleDialogCommit',
    'busEmitEventName',
  ],
  data() {
    return {
      tempModuleId: '',
      tempModuleList: [],

      projectIdHistory: [],  // 用于存服务改变的历史
      moduleListHistory: [],  // 用于存模块改变的历史
    }
  },

  mounted() {

    // 监听服务选择框选中的服务id，获取对应的模块列表
    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (project) => {
        this.getModulesByProjectId(project.id)
      })
    }

    // 是否监控模块的改变
    if (this.busOnModuleDialogCommit) {
      this.$bus.$on(this.busOnModuleDialogCommit, (status) => {
        this.moduleListHistory.push(status)
      })
    }
  },

  // 组件销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
    if (this.busOnModuleDialogCommit) {
      this.$bus.$off(this.busOnModuleDialogCommit)
    }
  },

  methods: {

    // 获取服务id对应的模块列表
    getModulesByProjectId(project_id) {
      moduleList({'projectId': project_id}).then(response => {
        this.tempModuleList = response.data.data
      })
    },

    sendEmit() {
      if (this.busEmitEventName) {
        this.$bus.$emit(this.busEmitEventName, this.tempModuleId)
      }
    },

    // 通过bus发送选中的模块
    clickModule(val) {
      this.sendEmit()
    }

  },

  created() {
    this.tempModuleId = this.moduleId

    // 第一次加载的时候，获取对应的模块列表
    if (this.projectId) {
      this.getModulesByProjectId(this.projectId)
    }
  },

  watch: {

    // 监控 状态，为true时，判断服务id是否有改变，有改变则重新请求模块列表
    "status": {
      handler(newVal, oldVal) {
        if (newVal) {
          // 判断服务id是否有改变，有改变则重新请求模块列表
          if (this.projectIdHistory && this.projectIdHistory[0] !== this.projectIdHistory[1]) {
            this.getModulesByProjectId(this.projectIdHistory[0])
          } else {
            this.getModulesByProjectId(this.projectId)
          }
        }
      }
    },

    // 监控服务id，发生变化时存到临时变量 projectIdHistory，待 status 监听到为true时请求模块列表
    'projectId': {
      handler(newVal, oldVal) {
        if (this.status) {
          this.getModulesByProjectId(newVal)
        } else {
          this.projectIdHistory = [newVal, oldVal]
        }
      }
    },

    'moduleId': {
      handler(newVal, oldVal) {
        this.tempModuleId = newVal
      }
    },

    'tempModuleList': {
      handler(newVal, oldVal) {
        // 如果没有选中模块id，则默认选择模块列表中的第一条数据
        if (newVal && !this.tempModuleId) {
          if (newVal[0]) {
            this.tempModuleId = newVal[0].id
          }
        }
        this.sendEmit()
      }
    }
  }
}
</script>

<style scoped>

</style>
