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

        <!--        <el-button-->
        <!--          v-show="currentProjectId"-->
        <!--          type="primary"-->
        <!--          size="mini"-->
        <!--          style="margin-left: 10px"-->
        <!--          @click.native="addParentSuite()"-->
        <!--        >添加一级用例集-->
        <!--        </el-button>-->
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
                  style="margin-left: 50px"
                  @click="addParentSuite()"
                >添加
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

                          <el-dropdown-item
                            @click.native.stop="addCase(node, data)"
                          >{{ '添加用例' }}
                          </el-dropdown-item>

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

    <!-- 新增/修改用例集表单 -->
    <el-drawer
      :title="moduleDrawerStatus === 'add' ? '新增用例集' : '修改用例集'"
      size="50%"
      :visible.sync="moduleDrawerIsShow"
      :direction="direction"
    >
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
            :disabled="isDisabled()"
            style="width: 97%"
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
          <el-popover
            class="el_popover_class"
            placement="top-start"
            trigger="hover"
          >
            <div>
              <div>1、基础用例集: 用于创建某一个步骤或者某一个节点，<span style="color: red">只能被当前服务下的用例引用</span></div>
              <div>2、引用用例集: 用于创建某一个节点、流程节点的用例集，<span style="color: red">只能被创建其他用例的时候引用</span></div>
              <div>3、单接口用例集: 用于创建测试单接口的用例集，<span style="color: red">只能被任务使用</span></div>
              <div>4、流程用例集: 用于创建测试流程的用例集，<span style="color: red">只能被任务使用</span></div>
              <div>5、造数据用例集: 用于创建快速造数据的用例集，提升手工测试效率，不能被其他用例引用，<span style="color: red">可在造数工具菜单使用</span></div>
              <div>6、<span style="color: red">管理员</span>可修改用例集类型</div>
            </div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
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
          @click=" moduleDrawerStatus === 'add' ? addCaseSuite() : changCaseSuite() "
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <selectRunEnv
      :data-type="dataType"
      :project-business-id="projectBusinessId"
    />
    <!--    :use-from="'caseIndex'"-->
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

import { getFindElementOption } from '@/utils/getConfig'
import { ellipsis, arrayToTree } from '@/utils/parseData'

import { apiMsgBelongTo, apiMsgBelongToStep, getAssertMapping } from '@/apis/apiTest/api' // 接口引用
import { projectList as apiProjectList } from '@/apis/apiTest/project'
import {
  getCaseSuite as apiGetCaseSuite,
  caseSuiteList as apiCaseSuiteTree,
  caseSuiteRun as apiCaseSuiteRun,
  deleteCaseSuite as apiDeleteCaseSuite,
  postCaseSuite as apiPostCaseSuite,
  putCaseSuite as apiPutCaseSuite
} from '@/apis/apiTest/caseSuite'

import { projectList as webUiProjectList } from '@/apis/webUiTest/project'
import {
  getCaseSuite as webUiGetCaseSuite,
  caseSuiteList as webUiCaseSuiteTree,
  caseSuiteRun as webUiCaseSuiteRun,
  deleteCaseSuite as webUiDeleteCaseSuite,
  postCaseSuite as webUiPostCaseSuite,
  putCaseSuite as webUiPutCaseSuite
} from '@/apis/webUiTest/caseSuite'

import { projectList as appUiProjectList } from '@/apis/appUiTest/project'
import {
  getCaseSuite as appUiGetCaseSuite,
  caseSuiteList as appUiCaseSuiteTree,
  caseSuiteRun as appUiCaseSuiteRun,
  deleteCaseSuite as appUiDeleteCaseSuite,
  postCaseSuite as appUiPostCaseSuite,
  putCaseSuite as appUiPutCaseSuite
} from '@/apis/appUiTest/caseSuite'
import { getConfigByName, getSkipIfDataSourceMapping, getSkipIfTypeMapping } from '@/apis/config/config'
import { extractMappingList, keyBoardCodeMappingList } from '@/apis/webUiTest/step'
import { phoneList, serverList } from '@/apis/appUiTest/env'

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
      filterText: '', // 查询关键字
      projectListData: [], // 项目列表
      currentProjectId: '', // 当前选中的项目id
      suiteTypeList: [], // 用例集类型列表
      setListData: [], // 用例集列表
      currentSuiteId: '', // 当前选中的用例集id，用于数据传递，获取用例列表
      currentSuiteIdForCommit: '', // 当前选中的模块id，用于提交新增、修改
      currentLevelForCommit: 1, // 当前选中的模块id，用于提交新增、修改
      currentParent: {}, // 当前选中的模块，用于提交新增、修改
      tempDataForm: {},
      queryAddrIsLoading: false,
      projectBusinessId: '',
      queryAddr: '',
      marker: 'suite',
      moduleDrawerIsShow: false,
      defaultCaseSuite: {},
      moduleDrawerStatus: '',
      dropdownStatus: false, // el-dropdown 的展开/隐藏状态
      currentLabel: '', // 当前鼠标滑入的节点名
      runType: 1,
      runEnv: 'test',
      runSuiteData: undefined,
      projectListUrl: '',
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
    } else if (this.dataType === 'webUi') {
      this.getCaseSuiteUrl = webUiGetCaseSuite
      this.projectListUrl = webUiProjectList
      this.caseSuiteTreeUrl = webUiCaseSuiteTree
      this.caseSuiteRunUrl = webUiCaseSuiteRun
      this.deleteCaseSuiteUrl = webUiDeleteCaseSuite
      this.postCaseSuiteUrl = webUiPostCaseSuite
      this.putCaseSuiteUrl = webUiPutCaseSuite
      getFindElementOption(this) // 获取定位方式
      getConfigByName({ 'name': 'browser_name' }).then(response => {
        this.$busEvents.data.runBrowserNameDict = JSON.parse(response.data)
      })
    } else {
      this.getCaseSuiteUrl = appUiGetCaseSuite
      this.projectListUrl = appUiProjectList
      this.caseSuiteTreeUrl = appUiCaseSuiteTree
      this.caseSuiteRunUrl = appUiCaseSuiteRun
      this.deleteCaseSuiteUrl = appUiDeleteCaseSuite
      this.postCaseSuiteUrl = appUiPostCaseSuite
      this.putCaseSuiteUrl = appUiPutCaseSuite
      getFindElementOption(this) // 获取定位方式
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
    getConfigByName({ 'name': this.dataType === 'api' ? 'api_suite_list' : 'ui_suite_list' }).then(response => {
      this.suiteTypeList = JSON.parse(response.data)
    })

    // 从后端获取数据类型映射
    getConfigByName({ 'name': 'data_type_mapping' }).then(response => {
      this.$busEvents.data.dataTypeMappingList = JSON.parse(response.data)
    })

    // 从后端获取跳过方式映射
    getSkipIfTypeMapping().then(response => {
      this.$busEvents.data.skipIfTypeMappingList = response.data
    })

    // 从后端获取跳过条件映射
    getSkipIfDataSourceMapping({ type: 'case' }).then(response => {
      this.$busEvents.data.caseSkipIfDataSourceMapping = response.data
    })

    // 从后端获取跳过条件映射
    getSkipIfDataSourceMapping({ type: 'step' }).then(response => {
      this.$busEvents.data.stepSkipIfDataSourceMapping = response.data
    })

    // 从后端获取app键盘code类型映射
    if (this.dataType === 'appUi') {
      getConfigByName({ 'name': 'app_key_code' }).then(response => {
        this.$busEvents.data.keyboardKeyCodeList = JSON.parse(response.data)
      })
    }

    // 从后端获取PC键盘code类型映射
    if (this.dataType === 'webUi') {
      // getConfigByName({'name': 'app_key_code'}).then(response => {
      //   this.$busEvents.data.keyboardKeyCodeList = JSON.parse(response.data)
      // })
      keyBoardCodeMappingList().then(response => {
        this.$busEvents.data.keyboardKeyCodeList = response.data
      })
    }

    // 从后端获取响应对象数据源映射
    if (this.dataType === 'api') {
      getConfigByName({ 'name': 'response_data_source_mapping' }).then(response => {
        this.$busEvents.data.responseDataSourceMappingList = JSON.parse(response.data)
      })

      // 从后端获取断言数方式映射
      getAssertMapping().then(response => {
        this.$busEvents.data.apiTestAssertMappingList = response.data
      })
    } else {
      // 从后端获取UI测试数据提取方式映射
      extractMappingList().then(response => {
        this.$busEvents.data.uiTestExtractMappingList = response.data
      })
    }

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

    // 判断用例集类型是否可编辑
    isDisabled() {
      // 管理员不限制
      if (localStorage.getItem('permissions').indexOf('admin') !== -1) {
        return false
      }
      return this.currentLevelForCommit !== 1 || this.moduleDrawerStatus !== 'add'
    },

    initNewSuite(data) {
      this.tempDataForm = {
        name: '',
        id: '',
        level: this.currentLevelForCommit + 1,
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
      this.currentLevelForCommit = 1 // 切换项目的时候，把选中用例集置为''
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
      this.currentLevelForCommit = data.level
      this.currentParent = data
      this.$refs.tree.store.nodesMap[data.id].expanded = !this.$refs.tree.store.nodesMap[data.id].expanded // 展开/收缩节点
    },

    // 添加一级用例集
    addParentSuite() {
      this.currentSuiteIdForCommit = ''
      this.currentLevelForCommit = 1
      this.currentParent = {}
      this.showCaseSuiteDialog('add')
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
      console.log('node: ', node)
      console.log('data: ', data)
      this.moduleDrawerStatus = command
      if (command === 'edit') {
        this.getCaseSuiteUrl({ id: data.id }).then(response => {
          this.tempDataForm = response.data
        })
      } else {
        this.initNewSuite(data)
      }
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
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.run_id)
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
      apiMsgBelongTo({ addr: this.queryAddr }).then(response => {
        this.queryAddrIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiFromIsShow', this.marker, response.data)
        }
      })
    },

    // 获取接口使用情况
    getApiMsgBelongToStep() {
      this.queryAddrIsLoading = true
      apiMsgBelongToStep({ addr: this.queryAddr }).then(response => {
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
