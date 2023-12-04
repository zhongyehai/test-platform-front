<template>

  <div class="app-container">

    <el-form label-width="60px" inline>
      <el-form-item :label="`${titleType}`" size="mini">
        <el-select
          v-model="currentProjectId"
          :placeholder="`选择${titleType}`"
          size="mini"
          style="width: 250px"
          filterable
          default-first-option
          @change="getSuiteList"
        >
          <el-option v-for="item in projectListData" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="dataType === 'api'" label="查接口" size="mini">
        <el-input
          v-model="queryAddr"
          class="input-with-select"
          placeholder="请输入接口地址"
          size="mini"
          clearable
          style="width: 400px"
        />
        <el-button
          v-show="queryAddr"
          type="primary"
          size="mini"
          :loading="queryAddrIsLoading"
          style="margin-left: 10px"
          @click.native="getApiMsgBelongTo()"
        >查归属
        </el-button>
        <el-button
          v-show="queryAddr"
          type="primary"
          size="mini"
          :loading="queryAddrIsLoading"
          style="margin-left: 10px"
          @click.native="getApiMsgBelongToStep()"
        >查使用情况
        </el-button>
      </el-form-item>
    </el-form>

    <el-row>

      <!-- 第一列服务树 -->
      <el-col style="width: 20%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <el-tabs v-model="projectTab" class="table_padding table_project">
          <el-tab-pane :label="projectTab" :name="projectTab">
            <template slot="label">
              <span> 用例集列表 </span>
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>{{ `为当前${titleType}添加一级用例集` }}</div>
                <el-button
                  v-show="currentProjectId"
                  slot="reference"
                  type="text"
                  style="margin-left: 30px"
                  @click="addParentSuite()"
                >添加
                </el-button>
              </el-popover>
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>{{ `为当前${titleType}导入用例集` }}</div>
                <el-button
                  v-show="currentProjectId"
                  slot="reference"
                  type="text"
                  style="margin-left: 30px"
                  @click="showUploadDrawer()"
                >导入
                </el-button>
              </el-popover>
            </template>

            <div class="custom-tree-container">
              <div class="block">
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" size="mini" />
                <el-tree
                  ref="tree"
                  class="project-tree"
                  :check-on-click-node="false"
                  :data="setListData"
                  :default-expanded-keys="[defaultCaseSuite]"
                  :empty-text="'请先添加一级用例集'"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  :highlight-current="true"
                  lazy
                  node-key="id"
                  @node-click="clickTree"
                  @node-drag-end="nodeDragEnd"
                >
                  <span
                    slot-scope="{ node, data }"
                    class="custom-tree-node"
                    @mouseenter="mouseenter(data)"
                    @mouseleave="mouseleave(data)"
                  >
                    <span> {{ data.name }} </span>
                    <span v-show="data.showMenu">
                      <el-dropdown
                        size="mini"
                        type="primary"
                        placement="top-start"
                        @visible-change="changeDropdownStatus"
                      >
                        <i
                          class="el-icon-more"
                          style="float: right;padding-left: 5px;color: #409EFF;transform: rotate(90deg)"
                        />

                        <el-dropdown-menu slot="dropdown">

                          <!--                          <el-dropdown-item-->
                          <!--                            @click.native.stop="addCase(node, data)"-->
                          <!--                          >{{ '添加用例' }}-->
                          <!--                          </el-dropdown-item>-->

                          <el-dropdown-item
                            @click.native.stop="showCaseSuiteDialog('add', node, data)"
                          >{{ '添加用例集' }}
                          </el-dropdown-item>

                          <el-dropdown-item
                            @click.native.stop="showCaseSuiteDialog('edit', node, data)"
                          >{{ '修改当前用例集' }}
                          </el-dropdown-item>

                          <el-dropdown-item
                            @click.native.stop="clickDeleteChild(node, data)"
                          >{{ '删除当前用例集' }}
                          </el-dropdown-item>

                          <el-dropdown-item
                            @click.native.stop="showRunCaseSuite(node, data)"
                          >{{ '运行当前用例集下的用例' }}
                          </el-dropdown-item>

                        </el-dropdown-menu>
                      </el-dropdown>
                    </span>
                  </span>
                </el-tree>
              </div>

            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <!-- 第二列，用例列表 -->
      <el-col style="width: 79%; margin-left: 5px">
        <!-- 用例管理组件 -->
        <caseManage
          :data-type="dataType"
          :current-set-id="currentSuiteId"
          :current-project-id="currentProjectId"
        />
      </el-col>

    </el-row>

    <!-- 导入用例集 -->
    <el-drawer
      :title="'上传用例集文件'"
      size="55%"
      :visible.sync="uploadFileDrawerIsShow"
      :direction="direction"
    >
      <div style="margin-left: 20px;margin-right: 20px">
        <div style="margin-bottom: 20px">
          1、必须<span style="color: red;">按照模板填写内容</span><br>
          2、必须使用<span style="color: red;">XMind8</span>版本 <a href="https://xmind.cn/download/xmind8/" target="_blank" style="color: #3a8ee6">去下载</a><br>
          3、导入后，<span style="color: red;">默认类型为流程用例集</span>，若要修改为其他类型，<span style="color: red;">只需修改一级用例集即可</span>，子用例集会跟随修改
        </div>
        <!-- 示例图片 -->
        <el-image :src="uploadCaseImage" />
        <el-row>
          <el-col :span="12">
            <el-upload
              class="upload-demo"
              :action="uploadAddrUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="uploadFile"
            >
              <el-button size="mini" type="primary">选择文件</el-button>
            </el-upload>
          </el-col>

          <el-col :span="12">
            <el-button size="mini" type="primary" style="float: right" @click="downloadTemplate">下载模板</el-button>
          </el-col>
        </el-row>
        <div v-if="uploadFailTotal > 0">
          <span>共失败 {{ uploadFailTotal }}条</span>
          {{ uploadFailList }}
        </div>
      </div>
      <div class="demo-drawer__footer">
        <el-button size="small" @click="uploadFileDrawerIsShow = false">关闭</el-button>
      </div>
    </el-drawer>

    <!-- 新增/修改用例集表单 -->
    <el-drawer
      :title="moduleDrawerStatus === 'add' ? '新增用例集' : '修改用例集'"
      size="50%"
      :visible.sync="moduleDrawerIsShow"
      :direction="direction"
    >
      <div style="margin: 0 20px 20px 20px">
        <div>1、基础用例集: 用于创建某一个步骤或者某一个节点，<span style="color: red">只能被当前服务下的用例引用</span></div>
        <div>2、引用用例集: 用于创建某一个节点、流程节点的用例集，<span style="color: red">只能被创建其他用例的时候引用</span></div>
        <div>3、单接口用例集: 用于创建测试单接口的用例集，<span style="color: red">只能被任务使用</span></div>
        <div>4、流程用例集: 用于创建测试流程的用例集，<span style="color: red">只能被任务使用</span></div>
        <div>5、造数据用例集: 用于创建快速造数据的用例集，提升手工测试效率，不能被其他用例引用，<span style="color: red">可在造数工具菜单使用</span></div>
        <div>6、修改<span style="color: red">一级用例集</span>的类型，<span style="color: red">子用例集</span>的类型会跟随修改</div>
      </div>
      <el-form
        ref="dataForm"
        :model="tempDataForm"
        label-position="left"
        label-width="100px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >
        <el-form-item :label="'用例集类型'" class="filter-item is-required" prop="name" size="mini">
          <el-select
            v-model="tempDataForm.suite_type"
            default-first-option
            size="mini"
            :disabled="tempDataForm.parent !== null"
            style="width: 100%"
            placeholder="请选择用例集类型"
            class="filter-item"
          >
            <el-option
              v-for="suiteType in suiteTypeList"
              :key="suiteType.key"
              :label="suiteType.value"
              :value="suiteType.key"
            />
          </el-select>
          <!--          <el-popover-->
          <!--            class="el_popover_class"-->
          <!--            placement="top-start"-->
          <!--            trigger="hover"-->
          <!--          >-->
          <!--            <div>-->
          <!--              <div>1、基础用例集: 用于创建某一个步骤或者某一个节点，<span style="color: red">只能被当前服务下的用例引用</span></div>-->
          <!--              <div>2、引用用例集: 用于创建某一个节点、流程节点的用例集，<span style="color: red">只能被创建其他用例的时候引用</span></div>-->
          <!--              <div>3、单接口用例集: 用于创建测试单接口的用例集，<span style="color: red">只能被任务使用</span></div>-->
          <!--              <div>4、流程用例集: 用于创建测试流程的用例集，<span style="color: red">只能被任务使用</span></div>-->
          <!--              <div>5、造数据用例集: 用于创建快速造数据的用例集，提升手工测试效率，不能被其他用例引用，<span style="color: red">可在造数工具菜单使用</span></div>-->
          <!--              <div>6、<span style="color: red">管理员</span>可修改用例集类型</div>-->
          <!--            </div>-->
          <!--            <el-button slot="reference" type="text" icon="el-icon-question" />-->
          <!--          </el-popover>-->
        </el-form-item>

        <el-form-item :label="'用例集名称'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="tempDataForm.name" placeholder="同一节点下，用例集名称不可重复" />
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="moduleDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="isShowLoading"
          @click="moduleDrawerStatus === 'add' ? addCaseSuite() : changCaseSuite() "
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <selectRunEnv
      :data-type="dataType"
      :project-business-id="projectBusinessId"
    />

    <runProcess
      :data-type="dataType"
    />

    <ApiEditDrawer />

    <showApiFromDrawer
      v-if="dataType === 'api'"
      :case-id="undefined"
      :marker="marker"
    />

    <showApiUseDrawer
      v-if="dataType === 'api'"
      :marker="marker"
    />
  </div>

</template>

<script>
import waves from '@/directive/waves'
import caseManage from '@/components/business/case' // 用例管理组件
import selectRunEnv from '@/components/selectRunEnv' // 环境选择组件
import runProcess from '@/components/runProcess' // 测试执行进度组件
import ApiEditDrawer from '@/views/apiTest/api/drawer.vue'
import showApiFromDrawer from '@/components/business/api/apiFromDrawer.vue'
import showApiUseDrawer from '@/components/business/api/apiUseDrawer.vue'

import { Loading } from 'element-ui'

import { getFindElementOption } from '@/utils/getConfig'
import { ellipsis, arrayToTree } from '@/utils/parseData'

import {
  apiMsgBelongTo,
  apiMsgBelongToStep
} from '@/apis/apiTest/api' // 接口引用
import { projectList as apiProjectList } from '@/apis/apiTest/project'
import {
  getCaseSuite as apiGetCaseSuite,
  caseSuiteList as apiCaseSuiteTree,
  caseSuiteRun as apiCaseSuiteRun,
  deleteCaseSuite as apiDeleteCaseSuite,
  postCaseSuite as apiPostCaseSuite,
  putCaseSuite as apiPutCaseSuite,
  uploadAddr as apiUploadAddr,
  caseSuiteUpload as apiCaseSuiteUpload, downloadSuiteTemplate
} from '@/apis/apiTest/suite'

import { projectList as webUiProjectList } from '@/apis/webUiTest/project'
import {
  getCaseSuite as webUiGetCaseSuite,
  caseSuiteList as webUiCaseSuiteTree,
  caseSuiteRun as webUiCaseSuiteRun,
  deleteCaseSuite as webUiDeleteCaseSuite,
  postCaseSuite as webUiPostCaseSuite,
  putCaseSuite as webUiPutCaseSuite,
  uploadAddr as webUiUploadAddr,
  caseSuiteUpload as webUiCaseSuiteUpload
} from '@/apis/webUiTest/suite'

import { projectList as appUiProjectList } from '@/apis/appUiTest/project'
import {
  getCaseSuite as appUiGetCaseSuite,
  caseSuiteList as appUiCaseSuiteTree,
  caseSuiteRun as appUiCaseSuiteRun,
  deleteCaseSuite as appUiDeleteCaseSuite,
  postCaseSuite as appUiPostCaseSuite,
  putCaseSuite as appUiPutCaseSuite,
  uploadAddr as appUiUploadAddr,
  caseSuiteUpload as appUiCaseSuiteUpload
} from '@/apis/appUiTest/suite'
import { getConfigByCode } from '@/apis/config/config'
import { phoneList, serverList } from '@/apis/appUiTest/device'

export default {
  name: 'Index',
  components: {
    caseManage,
    selectRunEnv,
    runProcess,
    showApiFromDrawer,
    showApiUseDrawer,
    ApiEditDrawer
  },
  directives: { waves },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType'],
  data() {
    return {
      titleType: this.dataType === 'api' ? '服务' : this.dataType === 'webUi' ? '项目' : 'APP',
      direction: 'rtl', // 抽屉打开方式
      projectTab: '用例集列表',
      isShowLoading: false, // 用例集编辑框提交Loading

      uploadHeaders: { 'X-Token': localStorage.getItem('token') },

      filterText: '', // 查询关键字
      projectListData: [], // 项目列表
      currentProjectId: '', // 当前选中的项目id
      suiteTypeList: [], // 用例集类型列表
      setListData: [], // 用例集列表
      currentSuiteId: '', // 当前选中的用例集id，用于数据传递，获取用例列表
      currentSuiteIdForCommit: '', // 当前选中的模块id，用于提交新增、修改
      currentParent: {}, // 当前选中的模块，用于提交新增、修改
      tempDataForm: {},
      queryAddrIsLoading: false,
      projectBusinessId: '',
      queryAddr: '',
      marker: 'suite',
      moduleDrawerIsShow: false,
      uploadFileDrawerIsShow: false,
      uploadFailList: [],
      uploadFailTotal: 0,
      defaultCaseSuite: {},
      moduleDrawerStatus: '',
      dropdownStatus: false, // el-dropdown 的展开/隐藏状态
      currentLabel: '', // 当前鼠标滑入的节点名
      runType: 1,
      runEnv: 'test',
      runSuiteData: undefined,
      uploadCaseImage: require('../../../assets/uploadCase.jpg'),
      projectListUrl: '',
      uploadAddrUrl: '',
      caseSuiteUploadUrl: '',
      caseSuiteTreeUrl: '',
      getCaseSuiteUrl: '',
      caseSuiteRunUrl: '',
      deleteCaseSuiteUrl: '',
      postCaseSuiteUrl: '',
      putCaseSuiteUrl: ''
    }
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.getCaseSuiteUrl = apiGetCaseSuite
      this.projectListUrl = apiProjectList
      this.caseSuiteTreeUrl = apiCaseSuiteTree
      this.caseSuiteRunUrl = apiCaseSuiteRun
      this.deleteCaseSuiteUrl = apiDeleteCaseSuite
      this.postCaseSuiteUrl = apiPostCaseSuite
      this.putCaseSuiteUrl = apiPutCaseSuite
      this.uploadAddrUrl = apiUploadAddr
      this.caseSuiteUploadUrl = apiCaseSuiteUpload
    } else if (this.dataType === 'webUi') {
      this.getCaseSuiteUrl = webUiGetCaseSuite
      this.projectListUrl = webUiProjectList
      this.caseSuiteTreeUrl = webUiCaseSuiteTree
      this.caseSuiteRunUrl = webUiCaseSuiteRun
      this.deleteCaseSuiteUrl = webUiDeleteCaseSuite
      this.postCaseSuiteUrl = webUiPostCaseSuite
      this.putCaseSuiteUrl = webUiPutCaseSuite
      this.uploadAddrUrl = webUiUploadAddr
      this.caseSuiteUploadUrl = webUiCaseSuiteUpload
      getFindElementOption(this, this.dataType) // 获取定位方式
      getConfigByCode({ code: 'browser_name' }).then(response => {
        this.$busEvents.data.runBrowserNameDict = response.data
      })
    } else {
      this.getCaseSuiteUrl = appUiGetCaseSuite
      this.projectListUrl = appUiProjectList
      this.caseSuiteTreeUrl = appUiCaseSuiteTree
      this.caseSuiteRunUrl = appUiCaseSuiteRun
      this.deleteCaseSuiteUrl = appUiDeleteCaseSuite
      this.postCaseSuiteUrl = appUiPostCaseSuite
      this.putCaseSuiteUrl = appUiPutCaseSuite
      this.uploadAddrUrl = appUiUploadAddr
      this.caseSuiteUploadUrl = appUiCaseSuiteUpload
      getFindElementOption(this, this.dataType) // 获取定位方式
      serverList().then(response => {
        this.$busEvents.data.runServerList = response.data.data
      })
      phoneList().then(response => {
        this.$busEvents.data.runPhoneList = response.data.data
      })
    }

    this.getProjectList()
  },

  mounted() {
    // 获取用例集类型
    getConfigByCode({ code: this.dataType === 'api' ? 'api_suite_list' : 'ui_suite_list' }).then(response => {
      this.suiteTypeList = response.data
    })

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'selectRunEnv' && _runUnit === 'set') {
        this.runCaseSuite(runDict)
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 导入文件
    uploadFile(response, file) {
      const form = new FormData()
      form.append('project_id', this.currentProjectId)
      form.append('file', file.raw)

      const loadingInstance = Loading.service({
        text: '文件上传、解析、写库需要些时间，请耐心等待',
        background: 'rgba(0, 0, 0, 0.8)'
      })

      this.caseSuiteUploadUrl(form).then((response) => {
        loadingInstance.close()

        if (this.showMessage(this, response)) {
          this.getSuiteList(this.currentProjectId)
        } else {
          this.uploadFailList = response.data.suite.fail.data
          this.uploadFailTotal = response.data.suite.fail.total
        }
      }
      )
    },

    // 下载导入模板
    downloadTemplate() {
      downloadSuiteTemplate().then(response => {
        const blob = new Blob([response], { type: 'application/vnd.xmind.workbook' })
        // 保存文件到本地
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob) // 生成一个url
        a.download = '用例集导入模板.xmind'
        a.click()
      })
    },

    initNewSuite(data) {
      this.tempDataForm = {
        name: '',
        id: '',
        suite_type: data ? data.suite_type : '',
        parent: this.currentSuiteIdForCommit || null,
        project_id: this.currentProjectId
      }
    },

    // el-dropdown 的展开/隐藏状态
    changeDropdownStatus(status) {
      this.dropdownStatus = status
    },

    // 获取服务列表
    getProjectList() {
      this.projectListUrl().then(response => {
        this.projectListData = response.data.data
      })
    },

    // 发送用例集树数据
    sendSuiteTreeIsDone(caseSuiteTree) {
      this.$bus.$emit(
        this.$busEvents.treeIsDone,
        'caseSuite',
        JSON.parse(JSON.stringify(caseSuiteTree)),
        'caseIndex'
      )
    },

    // 获取用例集列表
    getSuiteList(projectId) {
      this.currentSuiteId = '' // 切换项目的时候，把选中用例集置为''
      this.currentSuiteIdForCommit = '' // 切换项目的时候，把选中用例集置为''
      this.currentParent = {}
      this.caseSuiteTreeUrl({ 'project_id': projectId }).then(response => {
        var response_data = JSON.stringify(response.data.data) === '{}' ? [] : response.data.data
        this.setListData = arrayToTree(response_data, null)
        this.sendSuiteTreeIsDone(this.setListData)
      })

      // 获取所选服务的业务线id
      this.projectListData.forEach(project => {
        if (project.id === projectId) {
          this.projectBusinessId = project.business_id
        }
      })
    },

    // 点击树
    clickTree(data, node, element) {
      this.currentSuiteId = data.id
      this.currentSuiteIdForCommit = data.id
      this.currentParent = data
      this.$refs.tree.store.nodesMap[data.id].expanded = !this.$refs.tree.store.nodesMap[data.id].expanded // 展开/收缩节点
    },

    // 添加一级用例集
    addParentSuite() {
      this.currentSuiteIdForCommit = ''
      this.currentParent = {}
      this.showCaseSuiteDialog('add')
    },

    // 打开文件上传
    showUploadDrawer() {
      this.uploadFileDrawerIsShow = true
    },

    // 鼠标滑入的时候，设置一个值，代表展示菜单
    mouseenter(data) {
      if (this.dropdownStatus === false) {
        this.currentSuiteIdForCommit = data.id
        this.currentParent = data
      }
      this.currentLabel = JSON.parse(JSON.stringify(data.name))
      data.name = ellipsis(data.name, 10)
      this.$set(data, 'showMenu', true)
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      data.name = this.currentLabel
      this.$set(data, 'showMenu', false)
    },

    // 打开用例集编辑框
    showCaseSuiteDialog(command, node, data) {
      this.moduleDrawerStatus = command
      if (command === 'edit') {
        this.getCaseSuiteUrl({ id: data.id }).then(response => {
          this.tempDataForm = response.data
        })
      } else {
        this.initNewSuite(data)
      }
      this.isShowLoading = false
      this.moduleDrawerIsShow = true
    },

    // 添加用例集
    addCaseSuite() {
      this.isShowLoading = true
      this.postCaseSuiteUrl(this.tempDataForm).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.moduleDrawerIsShow = false

          // 把当前添加的节点加入到父节点下
          if (this.currentParent.id) {
            if (!this.currentParent.children) {
              this.$set(this.currentParent, 'children', [])
            }
            this.currentParent.children.push(response.data)
            this.$refs.tree.store.nodesMap[this.currentParent.id].expanded = true // 展开节点
          } else {
            this.setListData.push(response.data)
          }
          this.sendSuiteTreeIsDone(this.setListData)
        }
      })
    },

    // 修改用例集
    changCaseSuite() {
      this.isShowLoading = true
      this.putCaseSuiteUrl(this.tempDataForm).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.moduleDrawerIsShow = false
          this.currentParent.name = response.data.name

          this.sendSuiteTreeIsDone(this.setListData)
        }
      })
    },

    // 关键字查询用例集
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    // 点击删除节点
    clickDeleteChild(node, data) {
      this.confirmBox(this.deleteChild, data, data.name)
    },

    // 删除节点
    deleteChild(data) {
      this.deleteCaseSuiteUrl({ 'id': data.id }).then(response => {
        if (this.showMessage(this, response)) {
          this.$refs.tree.remove(data)

          this.sendSuiteTreeIsDone(this.setListData)
        }
      })
    },

    // 添加用例
    addCase(node, data) {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'caseInfo',
        'add',
        null,
        'caseIndex'
      )
    },

    // 点击运行测试用例集
    showRunCaseSuite(node, data) {
      this.runSuiteNode = node
      this.runSuiteData = data
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'set', true)
    },

    // 运行用例集的用例
    runCaseSuite(runConf) {
      this.caseSuiteRunUrl({
        'id': this.runSuiteData ? this.runSuiteData.id : undefined,
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        no_reset: runConf.noReset,
        'trigger_type': 'page'
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id, response.data.report_id)
        }
      })
    },

    /**
     * 拖拽排序
     * start_node: 被拖拽节点对应的 Node、
     * end_node: 结束拖拽时最后进入的节点（可能为空）、
     * position: 被拖拽节点的放置位置（before、after、inner）、event
     * event
     */
    nodeDragEnd(start_node, end_node, position, event) {
    },

    // 获取接口归属
    getApiMsgBelongTo() {
      this.queryAddrIsLoading = true
      apiMsgBelongTo({ api_addr: this.queryAddr }).then(response => {
        this.queryAddrIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiFromIsShow', this.marker, response.data)
        }
      })
    },

    // 获取接口使用情况
    getApiMsgBelongToStep() {
      this.queryAddrIsLoading = true
      apiMsgBelongToStep({ api_addr: this.queryAddr }).then(response => {
        this.queryAddrIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiUseIsShow', this.marker, response.data)
        }
      })
    }

  }
}
</script>

<style scoped>
.project-tree {
  width: 100%;
  height: 800px;
  /*overflow: scroll;*/
}

.project-tree > .el-tree-node {
  display: inline-block;
  min-width: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
