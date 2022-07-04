<template>
  <div>
    <el-drawer
      :title="tempProject.id ? '修改项目' : '新增项目'"
      size="70%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content">

        <div style="margin-left: 20px">

          <el-tabs v-model="activeName" :before-leave="beforeLeave">
            <el-tab-pane label="项目信息" name="info">
              <el-form ref="dataForm" :model="tempProject" label-width="100px"
                       style="min-width: 200px;margin-left: 20px;margin-right: 20px">
                <el-form-item :label="'项目名'" prop="name" size="mini" class="is-required">
                  <el-input v-model="tempProject.name"/>
                </el-form-item>

                <el-form-item :label="'负责人'" prop="manager" size="mini" class="is-required">
                  <userSelector ref="userSelect" :user="tempProject.manager"></userSelector>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="环境管理" name="env">
              <div style="text-align: center">
                <el-radio v-model="currentEnv" :label="key" v-for="(value, key) in envMapping" :key="key">
                  {{ value }}</el-radio>
                <el-popconfirm
                  placement="top"
                  hide-icon
                  title="1、环境项数据来源于参数管理处的配置
                         2、若新加了环境项，对于每个项目请自行把环境数据同步到新加的环境上">
                  <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                </el-popconfirm>
              </div>

              <envEditor
                ref="envEditor"
                :currentEnv="currentEnv"
                :funcFilesList="funcFilesList"
                :currentProjectId="tempProject.id"
              ></envEditor>

            </el-tab-pane>

          </el-tabs>
        </div>

        <div class="demo-drawer__footer">
          <!-- 同步环境信息 -->
          <el-button
            style="float: left"
            v-if="tempProject.id"
            type="primary"
            size="mini"
            @click="showEnvSynchronizer()"
          >{{ '同步环境信息' }}
          </el-button>

            <el-button
              v-show="activeName === 'info'"
              type="primary"
              size="mini"
              @click="tempProject.id ? changProject() : addProject() "
              :loading="submitButtonIsLoading"
            >{{ tempProject.id ? '保存项目信息' : '新增项目信息' }}
            </el-button>

            <el-button
              v-show="activeName !== 'info'"
              type="primary"
              size="mini"
              @click="saveEnv()"
              :loading="submitEnvButtonIsLoading"
            >
            {{'保存' + envMapping[currentEnv] + '信息' }}
            </el-button>

        </div>
      </div>
      <envSynchronizer></envSynchronizer>
    </el-drawer>
  </div>
</template>

<script>
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import userSelector from "@/components/Selector/user";
import envEditor from "@/views/uiTest/project/envEditor";
import envSynchronizer from "@/views/uiTest/project/envSynchronizer";

import {postProject, putProject} from '@/apis/uiTest/project'
import {funcFileList} from "@/apis/apiTest/funcFile";
import {getConfigByName} from "@/apis/config/config";

export default {
  name: 'drawer',
  props: [
    'currentProject',
    'currentUserList'
  ],
  components: {
    headersView,
    variablesView,
    userSelector,
    envEditor,
    envSynchronizer
  },
  data() {
    return {
      drawerIsShow: false,  // 抽屉的显示状态
      direction: 'rtl',  // 抽屉打开方式
      activeName: 'info',

      // 临时数据，添加、修改
      tempProject: {
        id: null,
        name: null,
        manager: null,
        create_user: null
      },

      envMapping: {},  // 环境映射
      currentEnv: 'test',
      user_list: [],  // 用户列表
      funcFilesList: [],
      submitButtonIsLoading: false,
      submitEnvButtonIsLoading: false,
      submitButtonIsShow: true,
      infoCopy: {}
    }
  },

  methods: {

    // 获取环境配置
    initEnv() {
      getConfigByName({'name': 'run_test_env'}).then(response => {
        this.envMapping = JSON.parse(response.data.value)
      })
    },

    /* 点击切换tab
    * activeName：要去的标签页
    * oldActiveName：当前的标签页
    * */
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName === 'info' && !this.tempProject.id){
        this.activeName = oldActiveName
        this.submitButtonIsLoading = true
        let that = this
        postProject(this.getProjectForCommit()).then(response => {
          this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.tempProject = response.data
            this.sendIsCommitStatus()
            that.$bus.$emit(that.$busEvents.ui.uiClickApiProjectEnv, that.tempProject.id)
          }else {
            this.activeName = oldActiveName
          }
        })
      }else {
        this.$bus.$emit(this.$busEvents.ui.uiClickApiProjectEnv, this.tempProject.id)
      }
    },

    // 点击保存环境信息
    saveEnv(){
      this.submitEnvButtonIsLoading = true
      this.$bus.$emit(this.$busEvents.ui.uiSaveProjectEnv, this.activeName)
    },

    // 点击同步信息
    showEnvSynchronizer() {
      this.$bus.$emit(this.$busEvents.ui.uiShowEnvSynchronizer, this.tempProject.id)
    },

    // 获取自定义函数列表
    getFuncFileList() {
      funcFileList().then(response => {
        this.funcFilesList = response.data.data
      })
    },

    // 初始化临时项目数据 (新增)
    initTempProject() {
      this.tempProject = {
        id: null,
        name: null,
        manager: null
      }
      this.submitButtonIsShow = true
    },

    // 初始化临时项目数据 (修改)
    updateTempProject(row) {
      this.infoCopy = JSON.parse(JSON.stringify(row))
      this.tempProject.id = row.id
      this.tempProject.name = row.name
      this.tempProject.manager = row.manager
      this.submitButtonIsShow = true
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempProject.id,
        name: this.tempProject.name,
        manager: this.$refs.userSelect.tempData
      }
    },

    // 新增项目
    addProject() {
      this.submitButtonIsLoading = true
      postProject(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.infoCopy = JSON.parse(JSON.stringify(response.data))
          this.tempProject.id = response.data.id
          this.sendIsCommitStatus()
        }
      })
    },

    // 修改项目
    changProject() {
      this.submitButtonIsLoading = true
      putProject(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.infoCopy = JSON.parse(JSON.stringify(response.data))
          this.sendIsCommitStatus()
        }
      })
    },

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求项目列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.ui.uiProjectDialogCommitSuccess, 'success')
    },

  },

  mounted() {

    this.initEnv()
    this.getFuncFileList()

    this.$bus.$on(this.$busEvents.ui.uiShowApiProjectDrawer, (status, data) => {
      this.activeName = 'info'
      if (status === 'add') {
        this.initTempProject()  // 新增
      } else if (status === 'edit') {
        this.updateTempProject(data)  // 修改
      }
      this.drawerIsShow = true
    })

    // 环境提交成功后，取消loading、关闭抽屉
    this.$bus.$on(this.$busEvents.ui.uiEnvIsCommit, (projectId, host, env, status) => {
      this.submitEnvButtonIsLoading = false
      if (status){
        this.drawerIsShow = false
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.ui.uiShowApiProjectDrawer)
    this.$bus.$off(this.$busEvents.ui.uiEnvIsCommit)
  },

  watch: {

    // 接收并更新父组件传过来的用户列表
    'currentUserList': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.user_list = newVal
      }
    }

  }
}
</script>

<style scoped>

</style>
