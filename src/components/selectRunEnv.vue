<template>
  <!-- 选择环境和运行模式 -->
  <el-dialog title="选择运行环境" append-to-body :visible.sync="dialogIsShow" width="50%">

    <!-- 环境 -->
    <div>
      <label>选择环境：</label>
    </div>

    <div style="margin-top: 10px">
      <label>
        <span style="color: red">
          注：请确保此次运行中涉及到的所有服务都设置了当前选中环境的域名 <br>
          比如选择的测试环境，那么在运行的时候所有步骤都会找自己所在服务的测试环境的域名
        </span>
      </label>
    </div>

    <div style="margin-top: 10px">
      <el-radio v-model="runEnv" :label="key" v-for="(value, key) in runEnvData " :key="key">{{ value }}</el-radio>
    </div>

    <!-- 执行模式 -->
    <div v-if="runModeIsShow">
      <div style="margin-top: 40px">
        <label>执行模式： </label>
      </div>

      <div style="margin-top: 10px">
        <label>
          <span style="color: red">
            串行执行: 用例一条一条顺序串行执行 <br>
            并行执行: 每条用例一个线程并行执行 <br>
            注：并行执行仅仅是为了提升执行效率，请勿用于压力测试<br>
          </span>
        </label>
      </div>

      <div style="margin-top: 10px">
        <el-radio v-model="runType" :label="key" v-for="(value, key) in runModeData" :key="key">{{ value }}</el-radio>
      </div>

    </div>

    <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogIsShow = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="runData()">确 定</el-button>
    </span>

  </el-dialog>
</template>

<script>

import {getConfigByName, getRunModel} from "@/apis/config/config";  // 初始化超时时间

export default {
  name: "selectRunEnv",
  props: ['event', 'callBackEvent'],
  data() {
    return {
      dialogIsShow: false,
      runEnvData: {},
      runModeData: {},
      runEnv: 'test',
      runModeIsShow: false,
      runType: '0'
    }
  },
  methods: {

    // 点确定
    runData() {
      this.$bus.$emit(this.callBackEvent, {runEnv: this.runEnv, runType: parseInt(this.runType)})
      this.dialogIsShow = false
    },

    // 获取环境配置
    initEnv() {
      getConfigByName({'name': 'run_test_env'}).then(response => {
        this.runEnvData = JSON.parse(response.data.value)
      })
    },

    // 获取执行模式配置
    initRunMode() {
      getRunModel().then(response => {
        this.runModeData = response.data
      })
    }
  },

  mounted() {

    this.$bus.$on(this.event, (runModeIsShow) => {
      this.runModeIsShow = runModeIsShow
      this.dialogIsShow = true
    })

    this.initEnv()
    this.initRunMode()
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.event)
  },
}
</script>

<style scoped>

</style>
