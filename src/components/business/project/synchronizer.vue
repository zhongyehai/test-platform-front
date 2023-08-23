<template>

  <el-drawer
    title="同步环境"
    size="60%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <div class="demo-drawer__content">
      <div style="margin-left: 20px; margin-right: 20px">
        <el-tabs v-model="fromActiveName">
          <el-tab-pane label="从" name="from">
            <el-radio
              v-for="(runEnv) in runEnvList"
              :key="runEnv.id"
              v-model="dataSourceFrom"
              :label="runEnv.id"
              @change="changeRadio()"
            >{{ runEnv.name }}
            </el-radio>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div style="margin-left: 20px; margin-top: 20px; margin-right: 20px">
        <el-tabs v-model="toActiveName">
          <el-tab-pane label="同步到" name="to">
            <el-checkbox-group v-model="dataSourceTo">
              <el-checkbox
                v-for="(runEnv) in runEnvList"
                :key="runEnv.id"
                :disabled="runEnv.id === dataSourceFrom"
                :label="runEnv.id"
              >{{ runEnv.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click="saveEventSynchronizer() "
        >{{ '确定' }}
        </el-button>
      </div>

    </div>
  </el-drawer>

</template>

<script>

import { projectEnvSynchronization as apiProjectEnvSynchronization } from '@/apis/apiTest/project'
import { projectEnvSynchronization as webUiProjectEnvSynchronization } from '@/apis/webUiTest/project'
import { projectEnvSynchronization as appProjectEnvSynchronization } from '@/apis/appUiTest/project'

export default {
  name: 'EnvSynchronizer',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType'
  ],
  data() {
    return {
      drawerIsShow: false, // 抽屉的显示状态
      direction: 'rtl', // 抽屉打开方式
      projectEnvSynchronizationUrl: '',
      // 环境映射
      runEnvList: [],
      projectId: '',
      fromActiveName: 'from',
      toActiveName: 'to',
      dataSourceFrom: '',
      dataSourceTo: [],
      submitButtonIsLoading: false // 提交按钮的loading状态
    }
  },

  mounted() {
    if (this.dataType === 'api') {
      this.projectEnvSynchronizationUrl = apiProjectEnvSynchronization
    } else if (this.dataType === 'appUi') {
      this.projectEnvSynchronizationUrl = appProjectEnvSynchronization
    } else {
      this.projectEnvSynchronizationUrl = webUiProjectEnvSynchronization
    }

    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, projectId, runEnvList) => {
      if (_type === 'envSynchronizer') {
        this.projectId = projectId
        this.runEnvList = runEnvList
        this.submitButtonIsLoading = false
        this.drawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    // 单选钮选中时，如果复选框已选中了单选的值，则去除多选按钮的选中状态
    changeRadio(value) {
      const index = this.dataSourceTo.indexOf(this.dataSourceFrom)
      if (index !== -1) {
        this.dataSourceTo.splice(index, 1)
      }
    },

    // 保存环境设置
    saveEventSynchronizer() {
      this.submitButtonIsLoading = true
      this.projectEnvSynchronizationUrl({
        projectId: this.projectId,
        envFrom: this.dataSourceFrom,
        envTo: this.dataSourceTo }).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'envSynchronizer', response.data)
          this.drawerIsShow = false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
