<template>
  <el-drawer
    :title="tempEnv.id ? '修改环境' : '新增环境'"
    size="70%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <div class="demo-drawer__content">

      <el-row>
        <el-col :span="envType !== 'app' ? 3 : 0">
          <el-tabs :tab-position="tabPosition" v-model="activeName" :before-leave="changeEnv">
            <el-tab-pane
              :name="runEnv.id.toString()"
              :label="runEnv.name"
              v-for="(runEnv) in runEnvList"
              :key="runEnv.id">
            </el-tab-pane>
          </el-tabs>
        </el-col>

        <el-col :span="envType !== 'app' ? 21 : 24">
          <div>
            <el-form label-width="120px" v-show="envType !== 'app'">
              <el-form-item :label="'环境域名'" class="is-required" size="mini">
                <el-input v-model="tempEnv.host" placeholder="域名" style="width: 98%"/>
                <el-popover
                  class="el_popover_class"
                  placement="top-start"
                  trigger="hover">
                  <div>当前服务在当前环境的域名</div>
                  <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                </el-popover>
              </el-form-item>
            </el-form>

            <el-tabs style="margin-left: 10px">
              <!-- 公用变量 -->
              <el-tab-pane label="自定义变量">
                <el-tooltip class="item-tabs" effect="light" placement="top" slot="label">
                  <div slot="content">
                    1、可用此功能设置一些预设值，比如token、账号信息 <br/>
                    2、在此处设置的值，对于此服务下的接口、用例均可直接引用 <br/>
                    3、若此处设置的值key为a，value为1，则只需要在要使用时使用“$a”即可获取到“1” <br/>
                    4、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
                    5、若在用例的公用变量处设置了与此处同样的key，则会以用例处定义的变量覆盖此处的变量
                  </div>
                  <span>自定义变量</span>
                </el-tooltip>
                <variablesView
                  ref="variablesView"
                  :currentData="tempEnv.variables"
                  :dataTypeMapping="dataTypeMapping"
                  :placeholderKey="'key'"
                  :placeholderValue="'value'"
                  :placeholderDesc="'备注'"
                ></variablesView>
              </el-tab-pane>

              <!-- 头部信息 -->
              <el-tab-pane label="头部信息" v-if="envType === 'api'">
                <el-tooltip class="item-tabs" effect="light" placement="top" slot="label">
                  <div slot="content">
                    1、可用此功能设置当前服务的固定的头部参数，比如token、cookie <br/>
                    2、在此处设置的值，在运行此服务下的接口、用例的时候，会自动加到对应的接口/步骤的头部参数上 <br/>
                    3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
                    4、若在用例的头部参数处设置了与此处同样的key，则会以用例处定义的参数覆盖此处的参数
                  </div>
                  <span>头部信息</span>
                </el-tooltip>
                <headersView
                  ref="headersView"
                  :currentData="tempEnv.headers"
                  :placeholderKey="'key'"
                  :placeholderValue="'value'"
                  :placeholderDesc="'备注'"
                ></headersView>
              </el-tab-pane>
            </el-tabs>

          </div>
        </el-col>
      </el-row>

      <div class="demo-drawer__footer">
        <!-- 同步环境信息 -->
        <el-button
          v-if="envType !== 'app'"
          style="float: left"
          type="primary"
          size="mini"
          @click="showEnvSynchronizer()"
        >{{ '同步环境信息' }}
        </el-button>

        <el-button
          v-show="activeName"
          type="primary"
          size="mini"
          @click="saveEnv()"
          :loading="submitButtonIsLoading"
        >
          {{ '保存当前环境信息' }}
        </el-button>
        <el-popover
          class="el_popover_class"
          placement="top-start"
          trigger="hover">
          <div>
            <div>1、保存时，会遍历当环境变量的key和value同步到其他环境</div>
            <div>2、若其他环境没有当前的key，则会自动将变量的key和value同步到该环境</div>
            <div>3、若其他环境已有当前的key，则不会同步当前key的信息到该环境</div>
          </div>
          <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
        </el-popover>
      </div>
    </div>

    <!-- 同步环境 -->
    <envSynchronizer
      :envType="envType"
    ></envSynchronizer>

  </el-drawer>
</template>

<script>
import headersView from '@/components/Inputs/changeRow.vue'
import variablesView from '@/components/Inputs/variables.vue'
import envSynchronizer from "@/components/project/synchronizer.vue";

import {getProjectEnv as apiGetProjectEnv, putProjectEnv as apiPutProjectEnv} from '@/apis/apiTest/project'
import {getProjectEnv as webUiGetProjectEnv, putProjectEnv as webUiPutProjectEnv} from '@/apis/webUiTest/project'
import {getProjectEnv as appGetProjectEnv, putProjectEnv as appPutProjectEnv} from '@/apis/appUiTest/project'
import {runEnvList} from "@/apis/config/runEnv";

export default {
  name: 'envEditor',
  props: [
    'envType',
    'dataTypeMapping'
  ],
  components: {
    headersView,
    variablesView,
    envSynchronizer
  },
  data() {
    return {
      drawerIsShow: false,  // 抽屉的显示状态
      direction: 'rtl',  // 抽屉打开方式
      tabPosition: 'left',
      activeName: '',
      defaultActiveName: '',
      getProjectEnvUrl: '',
      putProjectEnvUrl: '',
      // 临时数据
      tempEnv: {
        id: '',
        host: '',
        project_id: '',
        headers: [{'key': "", 'value': "", 'remark': ""}],
        variables: [{'key': "", 'value': "", 'remark': ""}]
      },
      runEnvList: [],
      submitButtonIsLoading: false,  // 提交按钮的loading状态
    }
  },

  methods: {

    // 切换环境时，自动保存，保存失败则不切换
    changeEnv(activeName, oldActiveName) {
      return new Promise((resolve, reject) => {
        if (oldActiveName && oldActiveName !== '0') {
          this.submitButtonIsLoading = true
          this.tempEnv.env_id = parseInt(this.activeName)
          this.tempEnv.variables = this.$refs.variablesView.tempData
          if (this.envType === 'api') {
            this.tempEnv.headers = this.$refs.headersView.tempData
          }
          this.putProjectEnvUrl(this.tempEnv).then(response => {
            this.submitButtonIsLoading = false
            return this.showMessage(this, response) ? resolve() : reject()
          })
        }
      })
    },

    // 保存环境设置
    saveEnv() {
      this.submitButtonIsLoading = true
      this.tempEnv.env_id = parseInt(this.activeName)
      this.tempEnv.variables = this.$refs.variablesView.tempData
      if (this.envType === 'api') {
        this.tempEnv.headers = this.$refs.headersView.tempData
      }
      this.putProjectEnvUrl(this.tempEnv).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
        }
      })
    },

    // 获取环境信息
    getEnv(envId, projectId) {
      this.getProjectEnvUrl({env_id: envId, projectId: projectId}).then(response => {
        this.tempEnv.id = response.data.id
        this.tempEnv.env_id = response.data.env_id
        this.tempEnv.host = response.data.host
        this.tempEnv.headers = response.data.headers
        this.tempEnv.variables = response.data.variables
        this.tempEnv.project_id = response.data.project_id
      })
    },

    // 点击同步信息
    showEnvSynchronizer() {
      this.$bus.$emit(this.$busEvents.showEnvSynchronizer, this.tempEnv.project_id, this.runEnvList)
    },
  },

  mounted() {

    // 获取环境配置
    runEnvList({}).then(response => {
      this.runEnvList = response.data.data
      if (this.runEnvList.length > 0) {
        this.activeName = this.runEnvList[0].id.toString()
      }
    })

    if (this.envType === 'api') {
      this.getProjectEnvUrl = apiGetProjectEnv
      this.putProjectEnvUrl = apiPutProjectEnv
    } else if (this.envType === 'app') {
      this.getProjectEnvUrl = appGetProjectEnv
      this.putProjectEnvUrl = appPutProjectEnv
    } else {
      this.getProjectEnvUrl = webUiGetProjectEnv
      this.putProjectEnvUrl = webUiPutProjectEnv
    }

    // 监听打开环境编辑抽屉
    this.$bus.$on(this.$busEvents.showProjectEnvDrawer, (project) => {
      this.drawerIsShow = true
      this.getEnv(this.activeName, project.id)
    })

    // 监听 环境同步是否完成 的状态
    this.$bus.$on(this.$busEvents.envSynchronizerIsSuccess, (envData) => {
      if (envData[this.tempEnv]) {
        this.tempEnv.headers = envData[this.tempEnv].headers
        this.tempEnv.variables = envData[this.tempEnv].variables
      }
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.showProjectEnvDrawer)
    this.$bus.$off(this.$busEvents.envSynchronizerIsSuccess)
  },

  watch: {
    "activeName": {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal && this.tempEnv.project_id) {
          this.getEnv(newVal, this.tempEnv.project_id)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
