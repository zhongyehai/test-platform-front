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
          <el-form ref="dataForm" :model="tempProject" label-width="100px"
                   style="min-width: 200px;margin-left: 20px;margin-right: 20px">
            <el-form-item :label="'项目名'" prop="name" size="mini" class="is-required">
              <el-input v-model="tempProject.name"/>
            </el-form-item>

            <el-form-item :label="'负责人'" prop="manager" size="mini" class="is-required">
              <userSelector ref="userSelect" :user="tempProject.manager"></userSelector>
            </el-form-item>

            <el-form-item
              :label="'服务地址'"
              prop="service_addr"
              size="mini"
              class="is-required">
              <el-input
                v-model="tempProject.service_addr"
                style="width: 98%"
                placeholder="当前服务的地址，勿填写域名"/>
              <el-popover
                class="el_popover_class"
                placement="top-start"
                trigger="hover">
                <div>
                  此处填写当前服务的地址，勿填写域名，方便测试时随意切换要跑的环境域名 <br>
                  如：用户服务为 http://127.0.0.1:8080/#/user/，则此处填写 /user，若没有设置服务地址，则填写 / 即可 <br>
                  运行测试时将使用【选择的环境对应的域名+此处的服务地址+页面地址】组装为完整的请求地址
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
              </el-popover>
            </el-form-item>

            <!-- 函数文件 -->
            <el-form-item label="函数文件" prop="func_files" size="mini">
              <funcFileView
                ref="funcFiles"
                :funcFiles="tempProject.func_files"
                :currentFuncFileList="funcFilesList"
              ></funcFileView>
              <el-popover
                class="el_popover_class"
                placement="top-start"
                trigger="hover">
                <div>
                  <div>1、若服务下要用到自定义函数可以在这里统一引用对应的函数文件</div>
                  <div>2、此处引用的函数文件，对于当前服务下的接口、用例均有效</div>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
              </el-popover>
            </el-form-item>

            <!-- 业务线 -->
            <el-form-item label="业务线" prop="business_id" size="mini" class="is-required">
              <businessView
                ref="businessView"
                :isMultiple="false"
                :currentBusiness="tempProject.business_id"
              ></businessView>
            </el-form-item>

            <!-- 运行时使用域名设置 -->
            <el-form-item label="使用域名" prop="business_id" size="mini" class="is-required">
              <el-radio v-model="tempProject.use_host" label="env">环境设置</el-radio>
              <el-radio v-model="tempProject.use_host" label="project">服务设置</el-radio>
              <el-popover
                class="el_popover_class"
                placement="top-start"
                trigger="hover">
                <div>
                  <div>1、环境设置，此项目下的页面运行时，会使用 <span style="color: red">选择的环境处设置的域名</span> 来进行拼接为完全的请求地址</div>
                  <div>2、服务设置，此项目下的页面运行时，会使用 <span style="color: red">当前服务设置的域名</span> 来进行拼接为完全的请求地址</div>
                  <div><span style="color: red">注：若选择使用服务设置的域名，则服务环境管理处的域名需设置为http请求域名，而不是服务地址</span></div>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
              </el-popover>
            </el-form-item>

          </el-form>
        </div>

        <div class="demo-drawer__footer">
          <el-button size="mini" @click="drawerIsShow = false" style="float: left"> {{ '取消' }}</el-button>
          <el-button
            type="primary"
            size="mini"
            @click="tempProject.id ? changProject() : addProject() "
            :loading="submitButtonIsLoading"
          >{{ tempProject.id ? '保存项目信息' : '新增项目信息' }}
          </el-button>
        </div>
      </div>

      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogIsShow"
        width="40%"
        :before-close="closeDialog">
        <div style="text-align: center">
          {{ responseMessage + '，是否需要设置环境信息？' }}
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="mini" @click="closeDialog">不设置</el-button>
          <el-button size="mini" type="primary" @click="showEnvDrawer">要设置</el-button>
        </span>
      </el-dialog>

    </el-drawer>
  </div>
</template>

<script>
import userSelector from "@/components/Selector/user";
import funcFileView from '@/components/Selector/funcFile'
import businessView from '@/components/Selector/business'

import {postProject, putProject} from '@/apis/webUiTest/project'
import {funcFileList} from "@/apis/assist/funcFile";
import {businessList} from "@/apis/system/business";

export default {
  name: 'drawer',
  props: [
    'currentProject',
    'currentUserList'
  ],
  components: {
    userSelector,
    funcFileView,
    businessView
  },
  data() {
    return {
      drawerIsShow: false,  // 抽屉的显示状态
      direction: 'rtl',  // 抽屉打开方式
      // 临时数据，添加、修改
      tempProject: {
        id: null,
        name: null,
        manager: null,
        business_id: '',
        service_addr: '',
        func_files: [],
        create_user: null,
        use_host: 'env'
      },
      user_list: [],  // 用户列表
      funcFilesList: [],
      business_list: [],  // 业务线列表
      submitButtonIsLoading: false,
      submitButtonIsShow: true,
      responseMessage: '',
      dialogIsShow: false
    }
  },

  methods: {

    // 获取业务线列表
    getBusinessList() {
      businessList().then(response => {
        this.business_list = response.data.data
      })
    },

    // 关闭dialog
    closeDialog(done) {
      this.dialogIsShow = false  // 关闭dialog
      this.drawerIsShow = false  // 关闭抽屉
    },

    // 切换到环境编辑tab
    showEnvDrawer() {
      this.dialogIsShow = false  // 关闭dialog
      this.drawerIsShow = false  // 关闭抽屉
      this.$bus.$emit(this.$busEvents.showProjectEnvDrawer, this.tempProject)
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
        manager: null,
        func_files: [],
        use_host: 'env',
        service_addr: ''
      }
      this.submitButtonIsShow = true
    },

    // 初始化临时项目数据 (修改)
    updateTempProject(row) {
      this.tempProject.id = row.id
      this.tempProject.name = row.name
      this.tempProject.manager = row.manager
      this.tempProject.business_id = row.business_id
      this.tempProject.func_files = row.func_files
      this.tempProject.use_host = row.use_host
      this.tempProject.service_addr = row.service_addr
      this.submitButtonIsShow = true
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      return {
        id: this.tempProject.id,
        name: this.tempProject.name,
        use_host: this.tempProject.use_host,
        service_addr: this.tempProject.service_addr,
        manager: this.$refs.userSelect.tempData,
        business_id: this.$refs.businessView.business,
        func_files: this.$refs.funcFiles.tempFuncFiles,
      }
    },

    // 新增项目
    addProject() {
      this.submitButtonIsLoading = true
      postProject(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.responseMessage = response.message
          this.tempProject.id = response.data.id
          this.sendIsCommitStatus()
          this.dialogIsShow = true
        }
      })
    },

    // 修改项目
    changProject() {
      this.submitButtonIsLoading = true
      putProject(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.responseMessage = response.message
          this.sendIsCommitStatus()
          this.dialogIsShow = true
        }
      })
    },

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求项目列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.ui.uiProjectDialogCommitSuccess, 'success')
    },

  },

  mounted() {
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
