<template>

  <div style="margin-left: 20px; margin-right: 20px" :key="currentEnv">

    <el-form label-width="80px">
      <el-form-item :label="'环境地址'" class="filter-item is-required" size="mini">
        <el-input v-model="tempEnv.host" placeholder="域名，必填"/>
      </el-form-item>

      <!-- 函数文件 -->
      <el-tooltip class="item" effect="dark" placement="top-end">
        <div slot="content">
          若服务下要用到自定义函数可以在这里统一引用对应的函数文件 <br/>
          此处引用的函数文件，对于当前服务下的接口、用例均有效
        </div>
        <el-form-item label="函数文件" prop="func_files" size="mini">
          <funcFileView
            ref="funcFiles"
            :funcFiles="tempEnv.func_files"
            :currentFuncFileList="funcFilesList"
          ></funcFileView>
        </el-form-item>
      </el-tooltip>

    </el-form>

    <el-tabs style="margin-left: 20px" :key="currentEnv">
      <!-- 公用变量 -->
      <el-tab-pane label="公用变量">
        <el-tooltip class="item" effect="dark" placement="top-end">
          <div slot="content">
            1、可用此功能设置一些预设值，比如token、账号信息 <br/>
            2、在此处设置的值，对于此服务下的接口、用例均可直接引用 <br/>
            3、若此处设置的值key为a，value为1，则只需要在要使用时使用“$a”即可获取到“1” <br/>
            4、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
            5、若在用例的公用变量处设置了与此处同样的key，则会以用例处定义的变量覆盖此处的变量
          </div>
          <variablesView
            :currentData="tempEnv.variables"
            :placeholderKey="'key'"
            :placeholderValue="'value'"
            :placeholderDesc="'备注'"
          ></variablesView>
        </el-tooltip>
      </el-tab-pane>

      <!-- 头部信息 -->
      <el-tab-pane label="头部信息">
        <el-tooltip class="item" effect="dark" placement="top-end">
          <div slot="content">
            1、可用此功能设置当前服务的固定的头部参数，比如token、cookie <br/>
            2、在此处设置的值，在运行此服务下的接口、用例的时候，会自动加到对应的接口/步骤的头部参数上 <br/>
            3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
            4、若在用例的头部参数处设置了与此处同样的key，则会以用例处定义的参数覆盖此处的参数
          </div>
          <headersView
            :currentData="tempEnv.headers"
            :placeholderKey="'key'"
            :placeholderValue="'value'"
            :placeholderDesc="'备注'"
          ></headersView>
        </el-tooltip>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import funcFileView from '@/components/Selector/funcFile'

import {getProjectEnv, putProjectEnv} from '@/apis/apiTest/project'

export default {
  name: 'envEditor',
  props: [
    'currentEnv',
    'funcFilesList',
    'currentProjectId'
  ],
  components: {
    headersView,
    funcFileView,
    variablesView
  },
  data() {
    return {
      // 临时数据
      tempEnv: {
        id: '',
        env: '',
        host: '',
        project_id: '',
        func_files: [],
        headers: [{'key': "", 'value': "", 'remark': ""}],
        variables: [{'key': "", 'value': "", 'remark': ""}]
      },

      submitButtonIsLoading: false,  // 提交按钮的loading状态
      initData: {}
    }
  },

  methods: {

    // 保存环境设置
    saveEvent() {
      console.log('saveEventsaveEventsaveEventsaveEventsaveEvent')
      this.submitButtonIsLoading = true
      this.tempEnv.env = this.currentEnv
      this.tempEnv.func_files = this.$refs.funcFiles.tempFuncFiles
      this.tempEnv.project_id = this.tempProjectId
      putProjectEnv(this.tempEnv).then(response => {
        this.submitButtonIsLoading = false
        this.$bus.$emit(
          this.$busEvents.api.apiEnvIsCommit,
          this.tempEnv.project_id,
          this.tempEnv.host,
          this.currentEnv,
          this.showMessage(this, response)
        )
        this.initData = JSON.parse(JSON.stringify(this.tempEnv))
      })
    },

    // 获取环境信息
    getEnv(env, projectId) {
      getProjectEnv({env: env, projectId: projectId}).then(response => {
        this.initData = JSON.parse(JSON.stringify(response.data))
        this.tempEnv.id = response.data.id
        this.tempEnv.env = response.data.env
        this.tempEnv.host = response.data.host
        this.tempEnv.headers = response.data.headers
        this.tempEnv.variables = response.data.variables
        this.tempEnv.project_id = response.data.project_id
        this.tempEnv.func_files = response.data.func_files
      })
    },
  },

  created() {
    this.env = this.currentEnv || 'test'
    this.tempProjectId = this.currentProjectId
  },

  mounted() {

    this.initData = this.tempEnv

    // 监听 是否保存环境
    this.$bus.$on(this.$busEvents.api.apiSaveProjectEnv, (env) => {
      this.saveEvent()
    })

    // 监听 点击环境设置面板 的状态
    this.$bus.$on(this.$busEvents.api.apiClickProjectEnv, (projectId) => {
      this.getEnv(this.currentEnv, projectId)
    })

    // 监听 环境同步是否完成 的状态
    this.$bus.$on(this.$busEvents.api.apiEnvSynchronizerIsSuccess, (envData) => {
      if (envData[this.tempEnv]) {
        this.tempEnv.headers = envData[this.tempEnv].headers
        this.tempEnv.variables = envData[this.tempEnv].variables
        this.tempEnv.func_files = envData[this.tempEnv].func_files
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiClickProjectEnv)
    this.$bus.$off(this.$busEvents.api.apiEnvSynchronizerIsSuccess)
  },

  watch: {
    'currentProjectId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.tempProjectId = newVal
      }
    },

    'currentEnv':{
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal){
          this.getEnv(newVal, this.currentProjectId)
        }
      }
    },
  }
}
</script>

<style scoped>

</style>
