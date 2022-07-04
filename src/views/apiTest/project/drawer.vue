<template>
  <div>
    <el-drawer
      :title="tempProject.id ? '修改服务' : '新增服务'"
      size="70%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content">

        <div style="margin-left: 20px">

          <el-tabs v-model="activeName" :before-leave="beforeLeave">
            <el-tab-pane label="服务信息" name="info">
              <el-form ref="dataForm" :model="tempProject" label-width="100px"
                       style="min-width: 200px;margin-left: 20px;margin-right: 20px">
                <el-form-item :label="'服务名'" prop="name" size="mini" class="is-required">
                  <el-input v-model="tempProject.name"/>
                </el-form-item>

                <el-form-item :label="'负责人'" prop="manager" size="mini" class="is-required">
                  <userSelector ref="userSelect" :user="tempProject.manager"></userSelector>
                </el-form-item>
                <el-form-item :label="'swagger地址'" prop="swagger" class="filter-item" size="mini">
                  <el-input
                    v-model="tempProject.swagger"
                    style="width: 98%"
                    placeholder="当前服务的swagger地址，用于拉取模块、接口数据"/>
                  <el-popconfirm
                    placement="top"
                    hide-icon
                    :title="
                    '1、此处填写对应服务获取swagger数据的地址 \n' +
                    '2、回到列表页点击同步按钮，系统会自动获取swagger数据，并把其中的模块、接口同步到测试平台，无需手动录入 \n'+
                    '注：请输入获取swagger数据的地址，不要输入swagger-ui地址'">
                    <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                  </el-popconfirm>
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
import envEditor from "@/views/apiTest/project/envEditor";
import envSynchronizer from "@/views/apiTest/project/envSynchronizer";

import {postProject, putProject} from '@/apis/apiTest/project'
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
        swagger: '',
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

      // 从服务管理页面切到环境管理，则自动保存
      if (oldActiveName === 'info' && !this.tempProject.id){
        this.activeName = oldActiveName
        this.submitButtonIsLoading = true
        let that = this
        postProject(this.getProjectForCommit()).then(response => {
          this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.tempProject = response.data
            this.sendIsCommitStatus()
            that.$bus.$emit(that.$busEvents.api.apiClickProjectEnv, that.tempProject.id)
          }else {
            this.activeName = oldActiveName
          }
        })
      }else {
        this.$bus.$emit(this.$busEvents.api.apiClickProjectEnv, this.tempProject.id)
      }
    },

    // 点击同步信息
    showEnvSynchronizer() {
      this.$bus.$emit(this.$busEvents.api.apiShowEnvSynchronizer, this.tempProject.id)
    },

    // 获取自定义函数列表
    getFuncFileList() {
      funcFileList().then(response => {
        this.funcFilesList = response.data.data
      })
    },

    // 初始化临时服务数据 (新增)
    initTempProject() {
      this.tempProject = {
        id: null,
        name: null,
        manager: null,
        swagger: ''
      }
      this.submitButtonIsShow = true
    },

    // 初始化临时服务数据 (修改)
    updateTempProject(row) {
      this.infoCopy = JSON.parse(JSON.stringify(row))
      this.tempProject.id = row.id
      this.tempProject.name = row.name
      this.tempProject.manager = row.manager
      this.tempProject.swagger = row.swagger
      this.submitButtonIsShow = true
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempProject.id,
        name: this.tempProject.name,
        manager: this.$refs.userSelect.tempData,
        swagger: this.tempProject.swagger
      }
    },

    // 新增服务
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

    // 点击保存环境信息
    saveEnv(){
      this.submitEnvButtonIsLoading = true
      // console.log('this.activeName: ', this.activeName)
      this.$bus.$emit(this.$busEvents.api.apiSaveProjectEnv, this.currentEnv)
    },

    // 修改服务
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

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求服务列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.api.apiProjectDrawerCommitSuccess, 'success')
    },

  },

  mounted() {

    this.initEnv()
    this.getFuncFileList()

    this.$bus.$on(this.$busEvents.api.apiShowProjectDrawer, (status, data) => {
      this.activeName = 'info'
      if (status === 'add') {
        this.initTempProject()  // 新增
      } else if (status === 'edit') {
        this.updateTempProject(data)  // 修改
      }
      this.drawerIsShow = true
    })

    // 环境提交成功后，取消loading、关闭抽屉
    this.$bus.$on(this.$busEvents.api.apiEnvIsCommit, (projectId, host, env, status) => {
      this.submitEnvButtonIsLoading = false
      if (status){
        this.drawerIsShow = false
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiShowProjectDrawer)
    this.$bus.$off(this.$busEvents.api.apiEnvIsCommit)
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
