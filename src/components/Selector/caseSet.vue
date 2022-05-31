<template>
  <el-select
    v-model="tempCaseSetId"
    placeholder="请选择用例集"
    value-key="id"
    filterable
    default-first-option
    size="mini"
    style="width: 100%"
    @change="choiceCaseSet">
    <el-option v-for="item in caseSetLists" :key="item.id" :label="item.name" :value="item.id">
    </el-option>
  </el-select>
</template>

<script>
import {caseSetList} from "@/apis/apiTest/caseSet";

export default {
  name: "caseSetSelector",
  props: [
    'projectId',
    'caseSetId',
    'isWatchStatus',
    'isMultiple',
    'busOnEventName',
    'busEmitEventName',
    'busOnCaseSetDialogCommit',
  ],
  data() {
    return {
      tempCaseSetId: '',
      caseSetLists: [],

      projectIdHistory: [],  // 用于存服务改变的历史
      caseSetIdHistory: []  // 用于存模块改变的历史
    }
  },

  mounted() {

    // 监听服务选择框选中的服务id，获取对应的模块列表
    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (project) => {
        this.getCaseSetListByProjectId(project.id)
      })
    }

    // 是否监控用例集的改变
    if (this.busOnCaseSetDialogCommit) {
      this.$bus.$on(this.busOnCaseSetDialogCommit, (status) => {
        this.caseSetIdHistory.push(status)
      })
    }
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
    if (this.busOnCaseSetDialogCommit) {
      this.$bus.$off(this.busOnCaseSetDialogCommit)
    }
  },

  methods: {

    // 根据服务id获取用例集
    getCaseSetListByProjectId(project_id) {
      caseSetList({'projectId': project_id}).then(response => {
        this.caseSetLists = response.data.data
      })
    },

    sendEmit() {
      if (this.busEmitEventName) {
        this.$bus.$emit(this.busEmitEventName, this.tempCaseSetId)
      }
    },

    // 通过bus发送选中的模块
    choiceCaseSet(val) {
      this.sendEmit()
    }
  },

  created() {
    this.tempCaseSetId = this.caseSetId

    // 第一次加载的时候，如果传了服务id，则获取对应的用例集列表
    if (this.projectId) {
      this.getCaseSetListByProjectId(this.projectId)
    }
  },

  watch: {

    // 监控 状态，为true时，判断服务id是否有改变，有改变则重新请求用例集列表，用于监控dialog是否为打开状态
    "isWatchStatus": {
      handler(newVal, oldVal) {
        if (newVal) {
          if (this.projectIdHistory && this.projectIdHistory[0] !== this.projectIdHistory[1]) {
            this.getCaseSetListByProjectId(this.projectIdHistory[0])
          } else {
            this.getCaseSetListByProjectId(this.projectId)
          }
        }
      }
    },

    // 监控服务id，发生变化时存到临时变量 projectIdHistory，待 status 监听到为true时请求用例集列表
    'projectId': {
      handler(newVal, oldVal) {
        if (this.isWatchStatus) {
          this.getCaseSetListByProjectId(newVal)
        } else {
          this.projectIdHistory = [newVal, oldVal]
        }
      }
    },

    'caseSetId': {
      handler(newVal, oldVal) {
        this.tempCaseSetId = newVal
      }
    },

    'caseSetLists': {
      handler(newVal, oldVal) {
        // 如果没有选中用例集id，则默认选择用例集列表中的第一条数据
        if (newVal && !this.caseSetId) {
          if (newVal[0]) {
            this.caseSetId = newVal[0].id
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
