<template>

  <el-drawer
    title="同步环境"
    size="60%"
    :append-to-body="true"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <div class="demo-drawer__content">
      <div style="margin-left: 20px; margin-right: 20px">
        <el-tabs v-model="fromActiveName">
          <el-tab-pane label="从" name="from">
            <el-radio
              v-model="dataSourceFrom"
              v-for="(value, key, index) in envMapping"
              :label="key"
              :key="key"
              @change="changeRadio()"
              border
            >{{ value }}
            </el-radio>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div style="margin-left: 20px; margin-top: 20px; margin-right: 20px">
        <el-tabs v-model="toActiveName">
          <el-tab-pane label="同步到" name="to">
            <el-checkbox-group v-model="dataSourceTo">
              <el-checkbox
                :disabled="key === dataSourceFrom"
                :label="key"
                v-for="(value, key, index) in envMapping"
                :key="key"
              >{{ value }}
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
          @click="saveEventSynchronizer() "
          :loading="submitButtonIsLoading"
        >{{ '确定' }}
        </el-button>
      </div>

    </div>
  </el-drawer>

</template>

<script>

import {projectEnvSynchronization} from '@/apis/apiTest/project'
import {getConfigByName} from "@/apis/config/config";

export default {
  name: 'envSynchronizer',
  data() {
    return {
      drawerIsShow: false,  // 抽屉的显示状态
      direction: 'rtl',  // 抽屉打开方式
      // 环境映射
      envMapping: {},
      projectId: '',
      fromActiveName: 'from',
      toActiveName: 'to',
      dataSourceFrom: 'test',
      dataSourceTo: [],
      submitButtonIsLoading: false  // 提交按钮的loading状态
    }
  },

  methods: {

    // 获取环境配置
    initEnv() {
      getConfigByName({'name': 'run_test_env'}).then(response => {
        this.envMapping = JSON.parse(response.data.value)
      })
    },

    // 单选钮选中时，如果复选框已选中了单选的值，则去除多选按钮的选中状态
    changeRadio(value){
      let index = this.dataSourceTo.indexOf(this.dataSourceFrom)
      if (index !== -1){
        this.dataSourceTo.splice(index,1)
      }
    },

    // 保存环境设置
    saveEventSynchronizer() {
      this.submitButtonIsLoading = true
      projectEnvSynchronization({
        projectId: this.projectId,
        envFrom: this.dataSourceFrom,
        envTo: this.dataSourceTo}).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.api.apiEnvSynchronizerIsSuccess, response.data)
          this.drawerIsShow = false
        }
      })
    },
  },

  mounted() {

    this.initEnv()

    this.$bus.$on(this.$busEvents.api.apiShowEnvSynchronizer, (projectId) => {
      this.projectId = projectId
      this.drawerIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiShowEnvSynchronizer)
  },
}
</script>

<style scoped>

</style>
