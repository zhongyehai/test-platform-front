<template>
  <el-drawer
    :title="tempEnv.id ? '修改环境' : '新增服务'"
    size="70%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <div class="demo-drawer__content">

      <div style="text-align: center">
        <el-radio v-model="currentEnv" :label="key" v-for="(value, key) in envMapping" :key="key">
          {{ value }}
        </el-radio>
        <el-popover
          class="el_popover_class"
          placement="top-start"
          trigger="hover">
          <div>
            <div>1、环境项数据来源于参数管理处的配置</div>
            <div>2、若新加了环境项，对于每个项目请自行把环境数据同步到新加的环境上</div>
          </div>
          <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
        </el-popover>
      </div>

      <div style="margin-left: 20px; margin-right: 20px">

        <el-form label-width="80px">
          <el-form-item :label="'环境地址'" class="filter-item is-required" size="mini">
            <el-input v-model="tempEnv.host" placeholder="域名，必填"/>
          </el-form-item>
        </el-form>

        <el-tabs style="margin-left: 20px">
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

      <div class="demo-drawer__footer">
        <!-- 同步环境信息 -->
        <el-button
          style="float: left"
          type="primary"
          size="mini"
          @click="showEnvSynchronizer()"
        >{{ '同步环境信息' }}
        </el-button>

        <el-button
          type="primary"
          size="mini"
          @click="saveEnv()"
          :loading="submitButtonIsLoading"
        >
          {{ '保存' + envMapping[currentEnv] + '信息' }}
        </el-button>

      </div>
    </div>

    <!-- 环境编辑 -->
    <envSynchronizer></envSynchronizer>

  </el-drawer>
</template>

<script>
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import envSynchronizer from "@/views/apiTest/project/envSynchronizer";

import {getProjectEnv, putProjectEnv} from '@/apis/apiTest/project'

export default {
  name: 'envEditor',
  props: [
    'envMapping'
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
      // 临时数据
      tempEnv: {
        id: '',
        env: '',
        host: '',
        project_id: '',
        headers: [{'key': "", 'value': "", 'remark': ""}],
        variables: [{'key': "", 'value': "", 'remark': ""}]
      },
      currentEnv: 'test',
      submitButtonIsLoading: false,  // 提交按钮的loading状态
    }
  },

  methods: {

    // 保存环境设置
    saveEnv() {
      this.submitButtonIsLoading = true
      this.tempEnv.env = this.currentEnv
      putProjectEnv(this.tempEnv).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(
            this.$busEvents.api.apiEnvIsCommit,
            this.tempEnv.project_id,
            this.tempEnv.host,
            this.currentEnv,
          )
          this.drawerIsShow = false
        }
      })
    },

    // 获取环境信息
    getEnv(env, projectId) {
      getProjectEnv({env: env, projectId: projectId}).then(response => {
        this.tempEnv.id = response.data.id
        this.tempEnv.env = response.data.env
        this.tempEnv.host = response.data.host
        this.tempEnv.headers = response.data.headers
        this.tempEnv.variables = response.data.variables
        this.tempEnv.project_id = response.data.project_id
      })
    },

    // 点击同步信息
    showEnvSynchronizer() {
      this.$bus.$emit(this.$busEvents.api.apiShowEnvSynchronizer, this.tempEnv.project_id)
    },
  },

  mounted() {

    // 监听打开环境编辑抽屉
    this.$bus.$on(this.$busEvents.api.apiShowProjectEnvDrawer, (proejct) => {
      this.drawerIsShow = true
      this.getEnv(this.currentEnv, proejct.id)
    })

    // 监听 环境同步是否完成 的状态
    this.$bus.$on(this.$busEvents.api.apiEnvSynchronizerIsSuccess, (envData) => {
      if (envData[this.tempEnv]) {
        this.tempEnv.headers = envData[this.tempEnv].headers
        this.tempEnv.variables = envData[this.tempEnv].variables
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiShowProjectEnvDrawer)
    this.$bus.$off(this.$busEvents.api.apiEnvSynchronizerIsSuccess)
  },

  watch: {
    "currentEnv": {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.getEnv(newVal, this.tempEnv.project_id)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
