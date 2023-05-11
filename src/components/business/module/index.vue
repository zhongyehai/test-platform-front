<template>

  <div class="app-container">

    <el-form label-width="60px" inline>
      <el-form-item :label="`${titleType}`" size="mini">
        <el-select
          v-model="tempDataForm.project_id"
          :placeholder="`选择${titleType}`"
          size="mini"
          style="width: 250px"
          filterable
          default-first-option
          @change="getModuleList"
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
      <el-col style="width: 15%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <el-tabs v-model="projectTab" class="table_padding table_project">
          <!--          <el-tab-pane :label="projectTab" :name="projectTab">-->
          <el-tab-pane :name="projectTab">

            <template slot="label">
              <span> 模块列表 </span>
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>{{ `为当前${titleType}添加一级模块` }}</div>
                <el-button
                  v-show="tempDataForm.project_id"
                  slot="reference"
                  type="text"
                  style="margin-left: 50px"
                  @click="addParentModule()"
                >添加</el-button>
              </el-popover>
            </template>

            <div class="custom-tree-container">
              <div class="block">
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" size="mini" />
                <el-scrollbar style="height:800px">
                  <el-tree
                    ref="tree"
                    class="project-tree"
                    :check-on-click-node="false"
                    :data="moduleListData"
                    :default-expanded-keys="[defaultModule]"
                    :empty-text="'请先添加一级模块'"
                    :expand-on-click-node="false"
                    :filter-node-method="filterNode"
                    :highlight-current="true"
                    lazy
                    node-key="id"
                    @node-click="clickTree"
                    @node-drag-end="nodeDragEnd"
                  >
                    <div
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
                            style="padding-left: 5px;color: #409EFF;transform: rotate(90deg)"
                          />
                          <el-dropdown-menu slot="dropdown">

                            <el-dropdown-item
                              @click.native.stop="addApiOrPage(node, data)"
                            >{{ dataType === 'api' ? '添加接口' : '添加页面' }}
                            </el-dropdown-item>

                            <!--                          <el-dropdown-item-->
                            <!--                            v-if="dataType === 'api'"-->
                            <!--                            @click.native.stop="showUploadFileDialog(node, data)"-->
                            <!--                          >{{ "导入接口" }}-->
                            <!--                          </el-dropdown-item>-->

                            <el-dropdown-item
                              @click.native.stop="showModuleDialog('add', node, data)"
                            >{{ '添加子模块' }}
                            </el-dropdown-item>

                            <el-dropdown-item
                              @click.native.stop="showModuleDialog('edit', node, data)"
                            >{{ '修改当前模块' }}
                            </el-dropdown-item>

                            <el-dropdown-item
                              @click.native.stop="clickDeleteChild(node, data)"
                            >{{ '删除当前模块' }}
                            </el-dropdown-item>

                          </el-dropdown-menu>
                        </el-dropdown>

                      </span>
                    </div>
                  </el-tree>
                </el-scrollbar>
              </div>

            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <!-- 第二列，接口列表 -->
      <el-col style="width: 84%; margin-left: 5px">
        <!-- 接口管理组件 -->
        <apiManage
          v-if="dataType === 'api'"
        />

        <pageManage
          v-else
          :data-type="dataType"
        />
      </el-col>

    </el-row>

    <el-drawer
      :title="'上传接口文件'"
      size="40%"
      :wrapper-closable="false"
      :visible.sync="uploadFileDrawerIsShow"
      :direction="direction"
    >
      <el-row style="margin-left: 20px;margin-right: 20px">
        <el-col :span="12">
          <el-upload
            class="upload-demo"
            :action="uploadApiMsg"
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
      <div class="demo-drawer__footer">
        <el-button size="small" @click="uploadFileDrawerIsShow = false">关闭</el-button>
      </div>
    </el-drawer>

    <!-- 新增/修改模块表单 -->
    <el-drawer
      :title="moduleDrawerStatus === 'add' ? '新增模块' : '修改模块'"
      size="40%"
      :visible.sync="moduleDrawerIsShow"
      :direction="direction"
    >
      <el-form
        ref="dataForm"
        :model="tempDataForm"
        label-position="left"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >

        <el-form-item :label="'模块名称'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="tempDataForm.name" placeholder="同一节点下，模块名称不可重复" />
        </el-form-item>

        <el-form-item v-if="dataType === 'api'" :label="'controller'" class="filter-item" prop="name" size="mini">
          <el-input v-model="tempDataForm.controller" disabled />
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="moduleDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="isShowLoading"
          @click=" moduleDrawerStatus === 'add' ? addModule() : changModule() "
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
import apiManage from '@/views/apiTest/api' // 接口管理组件
import pageManage from '@/components/business/page/index.vue'
import selectRunEnv from '@/components/selectRunEnv' // 环境选择组件
import runProcess from '@/components/runProcess' // 测试执行进度组件
import showApiFromDrawer from '@/components/business/api/apiFromDrawer.vue'
import showApiUseDrawer from '@/components/business/api/apiUseDrawer.vue'

import { ellipsis, arrayToTree } from '@/utils/parseData'

import { getConfigByName } from '@/apis/config/config'
import {
  apiMsgBelongTo,
  apiMsgBelongToStep,
  getAssertMapping,
  downloadApiMsgTemplate,
  uploadApi,
  uploadApiMsg
} from '@/apis/apiTest/api'

import { projectList as apiProjectList } from '@/apis/apiTest/project'
import {
  moduleTree as apiModuleTree,
  deleteModule as apiDeleteModule,
  postModule as apiPostModule,
  putModule as apiPutModule
} from '@/apis/apiTest/module'

import { projectList as webUiProjectList } from '@/apis/webUiTest/project'
import {
  moduleTree as webUiModuleTree,
  deleteModule as webUiDeleteModule,
  postModule as webUiPostModule,
  putModule as webUiPutModule
} from '@/apis/webUiTest/module'

import { projectList as appUiProjectList } from '@/apis/appUiTest/project'
import {
  moduleTree as appUiModuleTree,
  deleteModule as appUiDeleteModule,
  postModule as appUiPostModule,
  putModule as appUiPutModule
} from '@/apis/appUiTest/module'
import { phoneList, serverList } from '@/apis/appUiTest/env'

export default {
  name: 'Index',
  components: {
    apiManage,
    pageManage,
    selectRunEnv,
    runProcess,
    showApiFromDrawer,
    showApiUseDrawer
  },
  directives: { waves },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType'],
  data() {
    return {
      titleType: this.dataType === 'api' ? '服务' : this.dataType === 'webUi' ? '项目' : 'APP',
      direction: 'rtl', // 抽屉打开方式
      projectTab: '模块列表', // 服务tab的title
      filterText: '', // 查询关键字
      isShowLoading: false, // 模块编辑框提交Loading
      projectListData: [], // 项目列表
      moduleListData: [], // 模块列表
      currentModuleIdForCommit: '', // 当前选中的模块id，用于提交新增、修改
      currentLevelForCommit: 1, // 当前选中的模块id，用于提交新增、修改
      currentParent: {}, // 当前选中的模块，用于提交新增、修改
      tempDataForm: {
        name: '',
        id: '',
        level: '',
        parent: '',
        project_id: '',
        controller: ''
      },
      queryAddrIsLoading: false,
      moduleDrawerIsShow: false,
      moduleDrawerStatus: '',
      defaultModule: {},

      // 文件上传框打开状态
      uploadApiMsg: uploadApiMsg,
      uploadFileDrawerIsShow: false,
      fileDataList: [],

      // 当前鼠标滑入的节点名
      currentLabel: '',
      projectBusinessId: '',
      queryAddr: '',
      marker: 'module',

      projectListUrl: '',
      moduleTreeUrl: '',
      deleteModuleUrl: '',
      postModuleUrl: '',
      putModuleUrl: ''

    }
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.projectListUrl = apiProjectList
      this.moduleTreeUrl = apiModuleTree
      this.deleteModuleUrl = apiDeleteModule
      this.postModuleUrl = apiPostModule
      this.putModuleUrl = apiPutModule
    } else if (this.dataType === 'webUi') {
      this.projectListUrl = webUiProjectList
      this.moduleTreeUrl = webUiModuleTree
      this.deleteModuleUrl = webUiDeleteModule
      this.postModuleUrl = webUiPostModule
      this.putModuleUrl = webUiPutModule
      getConfigByName({ 'name': 'browser_name' }).then(response => {
        this.$busEvents.data.runBrowserNameDict = JSON.parse(response.data)
      })
    } else {
      this.projectListUrl = appUiProjectList
      this.moduleTreeUrl = appUiModuleTree
      this.deleteModuleUrl = appUiDeleteModule
      this.postModuleUrl = appUiPostModule
      this.putModuleUrl = appUiPutModule
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
    // 从后端获取数据类型映射
    getConfigByName({ 'name': 'data_type_mapping' }).then(response => {
      this.$busEvents.data.dataTypeMappingList = JSON.parse(response.data)
    })

    // 从后端获取响应对象数据源映射
    getConfigByName({ 'name': 'response_data_source_mapping' }).then(response => {
      this.$busEvents.data.responseDataSourceMappingList = JSON.parse(response.data)
    })

    // 从后端获取断言数方式映射
    getAssertMapping().then(response => {
      this.$busEvents.data.apiTestAssertMappingList = response.data
    })
  },

  methods: {

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

    // 获取模块列表
    getModuleList(projectId) {
      this.currentModuleIdForCommit = '' // 切换项目的时候，把选中模块置为''
      this.currentParent = {}
      this.currentLevelForCommit = 1 // 切换项目的时候，把选中模块置为''
      this.moduleTreeUrl({ 'project_id': projectId }).then(response => {
        var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data
        this.moduleListData = arrayToTree(response_data, null)

        this.sendModuleTreeIsDone(this.moduleListData)
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
      this.currentModuleIdForCommit = data.id
      this.currentLevelForCommit = data.level
      this.currentParent = data
      this.$refs.tree.store.nodesMap[data.id].expanded = !this.$refs.tree.store.nodesMap[data.id].expanded // 展开/收缩节点
      this.$bus.$emit(this.$busEvents.treeIsChoice, 'module', data.id, this.tempDataForm.project_id)
    },

    // 添加一级模块
    addParentModule() {
      this.currentModuleIdForCommit = ''
      this.currentLevelForCommit = 1
      this.currentParent = {}
      this.showModuleDialog('add')
    },

    // 鼠标滑入的时候，设置一个值，代表展示菜单
    mouseenter(data) {
      // if (this.dropdownStatus === false) {
      //   this.currentModuleIdForCommit = data.id
      //   this.currentParent = data
      // }
      this.currentModuleIdForCommit = data.id
      this.currentParent = data
      this.currentLabel = JSON.parse(JSON.stringify(data.name))
      data.name = ellipsis(data.name, 10)
      this.$set(data, 'showMenu', true)
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      data.name = this.currentLabel
      this.$set(data, 'showMenu', false)
    },

    // 模块编辑框
    showModuleDialog(command, node, data) {
      this.moduleDrawerStatus = command
      this.tempDataForm.name = command === 'edit' ? data.name : ''
      this.tempDataForm.controller = command === 'edit' ? data.controller : ''
      this.moduleDrawerIsShow = true
    },

    // 添加模块
    addModule() {
      this.isShowLoading = true
      this.postModuleUrl({
        name: this.tempDataForm.name,
        id: '',
        level: this.currentLevelForCommit + 1,
        parent: this.currentModuleIdForCommit || null,
        project_id: this.tempDataForm.project_id
      }).then(response => {
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
            this.moduleListData.push(response.data)
          }
          this.sendModuleTreeIsDone(this.moduleListData)
        }
      })
    },

    // 修改模块
    changModule() {
      this.isShowLoading = true
      this.putModuleUrl({
        name: this.tempDataForm.name,
        id: this.currentParent.id,
        level: this.currentParent.level,
        parent: this.currentParent.parent,
        project_id: this.currentParent.project_id
      }).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.moduleDrawerIsShow = false
          this.currentParent.name = response.data.name
          this.sendModuleTreeIsDone(this.moduleListData)
        }
      })
    },

    // 关键字查询模块
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
      this.deleteModuleUrl({ 'id': data.id }).then(response => {
        if (this.showMessage(this, response)) {
          this.$refs.tree.remove(data)
          this.sendModuleTreeIsDone(this.tempDataForm)
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

    // 添加接口/页面
    addApiOrPage(node, data) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, this.dataType === 'api' ? 'apiInfo' : 'pageInfo', 'add')
    },

    // 下载接口模板
    downloadTemplate() {
      downloadApiMsgTemplate().then(response => {
        const blob = new Blob([response], {
          type: 'application/vnd.ms-excel' // 将会被放入到blob中的数组内容的MIME类型
        })
        // 保存文件到本地
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob) // 生成一个url
        a.download = '接口导入模板'
        a.click()
      })
    },

    // 从excel导入接口
    showUploadFileDialog(node, data) {
      this.uploadFileDrawerIsShow = true
    },

    // 从excel导入接口
    uploadFile(response, file) {
      const form = new FormData()
      form.append('file', file.raw)
      form.append('id', this.currentParent.id)
      uploadApi(form).then((response) => {
        if (this.showMessage(this, response)) {
          this.fileDataList = []
          this.uploadFileDrawerIsShow = false
        }
      }
      )
    },

    // 发送模块树数据
    sendModuleTreeIsDone(moduleTree) {
      this.$bus.$emit(this.$busEvents.treeIsDone, 'module', JSON.parse(JSON.stringify(moduleTree)))
    }
  }
}
</script>

<style scoped>
.el-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
}

.el-tree > .el-tree-node {
  height: 900px;
  min-width: 100%;
  display: inline-block;
}

.project-tree {
  width: 100%;
  height: 100%;
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
