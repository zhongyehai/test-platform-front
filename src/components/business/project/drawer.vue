<template>
  <div>
    <el-drawer
      :title="tempProject.id ? `修改${titleType}` : `新增${titleType}`"
      size="70%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <div class="demo-drawer__content">

        <div style="margin-left: 20px">
          <el-form
            ref="dataForm"
            :model="tempProject"
            label-width="100px"
            style="min-width: 200px;margin-left: 20px;margin-right: 20px"
          >
            <el-form-item
              :label="dataType === 'api' ? '服务名' : dataType === 'webUi' ? '项目名' : 'app名'"
              prop="name"
              size="mini"
              class="is-required"
            >
              <el-input v-model="tempProject.name" />
            </el-form-item>

            <el-form-item :label="'负责人'" prop="manager" size="mini" class="is-required">
              <userSelector ref="userSelect" :user="tempProject.manager" />
            </el-form-item>

            <el-form-item
              v-if="dataType==='api'"
              :label="'swagger地址'"
              prop="swagger"
              class="filter-item"
              size="mini"
            >
              <el-input
                v-model="tempProject.swagger"
                style="width: 98%"
                placeholder="当前服务的swagger地址，用于拉取模块、接口数据"
              />
              <el-popover
                class="el_popover_class"
                placement="top-start"
                trigger="hover"
              >
                <div>
                  <div>1、此处填写对应服务获取swagger数据的地址</div>
                  <div>
                    2、回到列表页点击同步按钮，系统会自动获取swagger数据，并把其中的模块、接口同步到测试平台，无需手动录入
                  </div>
                  <div>注：请输入获取swagger数据的地址，不要输入swagger-ui地址</div>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <el-form-item
              v-if="dataType==='appUi'"
              label="app包名"
              prop="app_package"
              size="mini"
              class="is-required"
            >
              <el-input v-model="tempProject.app_package" style="width: 98%" />
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>查看命令：adb shell dumpsys window | findstr mCurrentFocus </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <el-form-item
              v-if="dataType==='appUi'"
              label="activity"
              prop="app_activity"
              size="mini"
              class="is-required"
            >
              <el-input v-model="tempProject.app_activity" style="width: 98%" />
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>查看命令：adb shell dumpsys window | findstr mCurrentFocus </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <el-form-item
              v-if="dataType==='appUi'"
              label="参照设备"
              prop="template_device"
              size="mini"
              class="is-required"
            >
              <el-select
                v-model="tempProject.template_device"
                filterable
                size="mini"
                style="width: 98%"
                placeholder="请选则元素定位时参照的设备"
              >
                <el-option
                  v-for="script in deviceList"
                  :key="script.id"
                  :label="script.name"
                  :value="script.id"
                />
              </el-select>
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>元素定位时参照的设备，用于坐标定位时计算元素的具体位置</div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <!-- 脚本文件 -->
            <el-form-item label="脚本文件" prop="func_files" size="mini">
              <scriptView
                ref="scriptView"
                :script-list="tempProject.script_list"
                :current-script-list-data="scriptListData"
              />
              <el-popover
                class="el_popover_class"
                placement="top-start"
                trigger="hover"
              >
                <div>
                  <div>1、若服务下要用到自定义函数可以在这里统一引用对应的脚本文件</div>
                  <div>2、此处引用的脚本文件，对于当前服务下的接口、用例均有效</div>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <!-- 业务线 -->
            <el-form-item label="业务线" prop="business_id" size="mini" class="is-required">
              <businessView
                ref="businessView"
                :is-multiple="false"
                :current-business="tempProject.business_id"
              />
            </el-form-item>

          </el-form>
        </div>

        <div class="demo-drawer__footer">
          <el-button size="mini" style="float: left" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
            type="primary"
            size="mini"
            :loading="submitButtonIsLoading"
            @click="tempProject.id ? changProject() : addProject() "
          >保存</el-button>
        </div>

      </div>

      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogIsShow"
        width="40%"
        :before-close="closeDialog"
      >
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
import userSelector from '@/components/Selector/user.vue'
import scriptView from '@/components/Selector/script.vue'
import businessView from '@/components/Selector/business.vue'

import { postProject as apiPostProject, putProject as apiPutProject } from '@/apis/apiTest/project'
import { postProject as webUiPostProject, putProject as webUiPutProject } from '@/apis/webUiTest/project'
import { postProject as AppPostProject, putProject as AppPutProject } from '@/apis/appUiTest/project'
import { scriptList } from '@/apis/assist/script'
import { phoneList } from '@/apis/appUiTest/device'

export default {
  name: 'Drawer',
  components: {
    userSelector,
    scriptView,
    businessView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'currentProject', 'currentUserList', 'dataType'
  ],
  data() {
    return {
      drawerIsShow: false, // 抽屉的显示状态
      direction: 'rtl', // 抽屉打开方式
      // 临时数据，添加、修改
      tempProject: {
        id: null,
        name: null,
        manager: null,
        swagger: undefined,
        business_id: undefined,
        app_package: undefined,
        app_activity: undefined,
        template_device: undefined,
        script_list: [],
        create_user: null
      },
      deviceList: [],
      titleType: this.dataType === 'api' ? '服务' : this.dataType === 'webUi' ? '项目' : 'APP',
      user_list: [], // 用户列表
      scriptListData: [],
      business_list: [], // 业务线列表
      submitButtonIsLoading: false,
      submitButtonIsShow: true,
      responseMessage: '',
      dialogIsShow: false,
      postUrl: '',
      putUrl: ''
    }
  },

  watch: {

    // 接收并更新父组件传过来的用户列表
    'currentUserList': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.user_list = newVal
      }
    }

  },

  created() {
    if (this.dataType === 'api') {
      this.postUrl = apiPostProject
      this.putUrl = apiPutProject
    } else if (this.dataType === 'appUi') {
      this.postUrl = AppPostProject
      this.putUrl = AppPutProject
    } else {
      this.postUrl = webUiPostProject
      this.putUrl = webUiPutProject
    }
  },

  mounted() {
    if (this.dataType === 'appUi' && this.deviceList.length === 0) {
      phoneList({ pageNum: 1, pageSize: 9999 }).then(response => {
        this.deviceList = response.data.data
      })
    }

    this.getScriptList()

    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, data) => {
      if (_type === 'projectInfo') {
        this.activeName = 'info'
        if (status === 'add') {
          this.initTempProject() // 新增
        } else if (status === 'edit') {
          this.updateTempProject(JSON.parse(JSON.stringify(data))) // 修改
        }
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

    // 关闭dialog
    closeDialog(done) {
      this.dialogIsShow = false // 关闭dialog
      this.drawerIsShow = false // 关闭抽屉
    },

    // 切换到环境编辑tab
    showEnvDrawer() {
      this.dialogIsShow = false // 关闭dialog
      this.drawerIsShow = false // 关闭抽屉
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'env', this.tempProject)
    },

    // 获取自定义函数列表
    getScriptList() {
      scriptList().then(response => {
        this.scriptListData = response.data.data
      })
    },

    // 初始化临时服务数据 (新增)
    initTempProject() {
      this.tempProject = {
        id: null,
        name: null,
        manager: null,
        swagger: undefined,
        business_id: undefined,
        app_package: undefined,
        app_activity: undefined,
        template_device: this.dataType === 'appUi' && this.deviceList.length > 0 ? this.deviceList[0].id : undefined,
        script_list: []
      }
      this.submitButtonIsShow = true
    },

    // 初始化临时服务数据 (修改)
    updateTempProject(row) {
      this.tempProject.id = row.id
      this.tempProject.name = row.name
      this.tempProject.manager = row.manager
      this.tempProject.swagger = row.swagger
      this.tempProject.business_id = row.business_id
      this.tempProject.app_package = row.app_package
      this.tempProject.app_activity = row.app_activity
      this.tempProject.template_device = row.template_device
      this.tempProject.script_list = row.script_list
      this.submitButtonIsShow = true
    },

    // 获取数据提交给后端
    getProjectForCommit() {
      this.tempProject.business_id = this.$refs.businessView.business
      return {
        id: this.tempProject.id,
        name: this.tempProject.name,
        swagger: this.tempProject.swagger,
        app_package: this.tempProject.app_package,
        app_activity: this.tempProject.app_activity,
        template_device: this.tempProject.template_device,
        manager: this.$refs.userSelect.tempData,
        business_id: this.tempProject.business_id,
        script_list: this.$refs.scriptView.tempScriptList
      }
    },

    // 新增服务
    addProject() {
      this.submitButtonIsLoading = true
      this.postUrl(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.responseMessage = response.message
          this.tempProject.id = response.data.id
          this.sendIsCommitStatus()
          this.dialogIsShow = true
        }
      })
    },

    // 修改服务
    changProject() {
      this.submitButtonIsLoading = true
      this.putUrl(this.getProjectForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.responseMessage = response.message
          this.sendIsCommitStatus()
          this.dialogIsShow = true
        }
      })
    },

    // 数据提交成功后，向父组件发送提交成功的消息，父组件重新请求服务列表
    sendIsCommitStatus() {
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'projectInfo')
    }

  }
}
</script>

<style scoped>

</style>
