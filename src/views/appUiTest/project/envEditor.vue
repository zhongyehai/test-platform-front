<template>
  <el-drawer
    :title="tempEnv.id ? '修改环境' : '新增环境'"
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

<!--        <el-form label-width="80px">-->
<!--          <el-form-item :label="'环境地址'" class="filter-item is-required" size="mini">-->
<!--            <el-input v-model="tempEnv.host" placeholder="域名，必填"/>-->
<!--          </el-form-item>-->

<!--        </el-form>-->

        <el-tabs style="margin-left: 20px">
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
    <envSynchronizer></envSynchronizer>

  </el-drawer>
</template>

<script>
import variablesView from '@/components/Inputs/variables'
import envSynchronizer from "@/views/apiTest/project/envSynchronizer";

import {getProjectEnv, putProjectEnv} from '@/apis/appUiTest/project'
import {getConfigByName} from "@/apis/config/config";

export default {
  name: 'envEditor',
  props: [
    'envMapping',
    'dataTypeMapping'
  ],
  components: {
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
        // host: '',
        project_id: '',
        variables: [{'key': "", 'value': "", 'remark': ""}]
      },
      currentEnv: '',
      submitButtonIsLoading: false,  // 提交按钮的loading状态
    }
  },

  methods: {

    // 保存环境设置
    saveEnv() {
      this.tempEnv.env = this.currentEnv
      this.tempEnv.variables = this.$refs.variablesView.tempData
      this.submitButtonIsLoading = true
      putProjectEnv(this.tempEnv).then(response => {
        this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.$bus.$emit(
              this.$busEvents.ui.uiEnvIsCommit,
              this.tempEnv.project_id,
              // this.tempEnv.host,
              this.currentEnv,
              this.showMessage(this, response)
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
        // this.tempEnv.host = response.data.host
        this.tempEnv.variables = response.data.variables
        this.tempEnv.project_id = response.data.project_id
      })
    },

    // 点击同步信息
    showEnvSynchronizer() {
      this.$bus.$emit(this.$busEvents.ui.uiShowEnvSynchronizer, this.tempEnv.project_id)
    },
  },

  mounted() {

    // 获取默认环境
    getConfigByName({'name': 'default_env'}).then(response => {
      this.currentEnv = response.data.value
    })

    // 监听打开环境编辑抽屉
    this.$bus.$on(this.$busEvents.ui.uiShowProjectEnvDrawer, (proejct) => {
      this.drawerIsShow = true
      this.getEnv(this.currentEnv, proejct.id)
    })

    // 监听 环境同步是否完成 的状态
    this.$bus.$on(this.$busEvents.ui.uiEnvSynchronizerIsSuccess, (envData) => {
      if (envData[this.tempEnv]) {
        this.tempEnv.variables = envData[this.tempEnv].variables
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.ui.uiShowProjectEnvDrawer)
    this.$bus.$off(this.$busEvents.ui.uiEnvSynchronizerIsSuccess)
  },

  watch: {
    'currentEnv': {
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
