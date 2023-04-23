<template>
  <el-select
    v-model="tempCaseSuiteId"
    placeholder="请选择用例集"
    value-key="id"
    filterable
    default-first-option
    size="mini"
    style="width: 100%"
    @change="choiceCaseSuite"
  >
    <el-option v-for="item in caseSuiteLists" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script>
import { caseSuiteList } from '@/apis/apiTest/caseSuite'

export default {
  name: 'CaseSuiteSelector',
  props: [
    'projectId',
    'caseSuiteId',
    'isWatchStatus',
    'isMultiple',
    'busOnEventName',
    'busEmitEventName',
    'busOnCaseSuiteDialogCommit'
  ],
  data() {
    return {
      tempCaseSuiteId: '',
      caseSuiteLists: [],

      projectIdHistory: [], // 用于存服务改变的历史
      caseSuiteIdHistory: [] // 用于存模块改变的历史
    }
  },

  watch: {

    // 监控 状态，为true时，判断服务id是否有改变，有改变则重新请求用例集列表，用于监控dialog是否为打开状态
    'isWatchStatus': {
      handler(newVal, oldVal) {
        if (newVal) {
          if (this.projectIdHistory && this.projectIdHistory[0] !== this.projectIdHistory[1]) {
            this.getCaseSuiteListByProjectId(this.projectIdHistory[0])
          } else {
            this.getCaseSuiteListByProjectId(this.projectId)
          }
        }
      }
    },

    // 监控服务id，发生变化时存到临时变量 projectIdHistory，待 status 监听到为true时请求用例集列表
    'projectId': {
      handler(newVal, oldVal) {
        if (this.isWatchStatus) {
          this.getCaseSuiteListByProjectId(newVal)
        } else {
          this.projectIdHistory = [newVal, oldVal]
        }
      }
    },

    'caseSuiteId': {
      handler(newVal, oldVal) {
        this.tempCaseSuiteId = newVal
      }
    },

    'caseSuiteLists': {
      handler(newVal, oldVal) {
        // 如果没有选中用例集id，则默认选择用例集列表中的第一条数据
        if (newVal && !this.caseSuiteId) {
          if (newVal[0]) {
            this.caseSuiteId = newVal[0].id
          }
        }
        this.sendEmit()
      }
    }
  },

  mounted() {
    // 监听服务选择框选中的服务id，获取对应的模块列表
    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (project) => {
        this.getCaseSuiteListByProjectId(project.id)
      })
    }

    // 是否监控用例集的改变
    if (this.busOnCaseSuiteDialogCommit) {
      this.$bus.$on(this.busOnCaseSuiteDialogCommit, (status) => {
        this.caseSuiteIdHistory.push(status)
      })
    }
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
    if (this.busOnCaseSuiteDialogCommit) {
      this.$bus.$off(this.busOnCaseSuiteDialogCommit)
    }
  },

  created() {
    this.tempCaseSuiteId = this.caseSuiteId

    // 第一次加载的时候，如果传了服务id，则获取对应的用例集列表
    if (this.projectId) {
      this.getCaseSuiteListByProjectId(this.projectId)
    }
  },

  methods: {

    // 根据服务id获取用例集
    getCaseSuiteListByProjectId(project_id) {
      caseSuiteList({ 'projectId': project_id }).then(response => {
        this.caseSuiteLists = response.data.data
      })
    },

    sendEmit() {
      if (this.busEmitEventName) {
        this.$bus.$emit(this.busEmitEventName, this.tempCaseSuiteId)
      }
    },

    // 通过bus发送选中的模块
    choiceCaseSuite(val) {
      this.sendEmit()
    }
  }
}
</script>

<style scoped>

</style>
