<template>

  <div class="app-container">

    <el-form label-width="150px" inline>
      <el-form-item :label="'选择服务：'" size="mini">
        <el-select
          v-model="currentProjectId"
          placeholder="选择服务"
          size="mini"
          style="width: 250px"
          filterable
          default-first-option
          @change="getSetList"
        >
          <el-option v-for="item in projectListData" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>

        <el-button
          v-show="currentProjectId"
          type="primary"
          size="mini"
          style="margin-left: 10px"
          @click.native="addParentSet()"
        >添加一级用例集
        </el-button>
      </el-form-item>

      <el-form-item v-if="dataType === 'api'" :label="'查询接口：'" size="mini">
        <el-input
          v-model="queryAddr"
          class="input-with-select"
          placeholder="请输入接口地址"
          size="mini"
          clearable
          style="width: 400px">
        </el-input>
        <el-button
          v-show="queryAddr"
          type="primary"
          size="mini"
          style="margin-left: 10px"
          @click.native="getApiMsgBelongTo()"
        >查归属
        </el-button>
        <el-button
          v-show="queryAddr"
          type="primary"
          size="mini"
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
            <div class="custom-tree-container">
              <div class="block">
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" size="mini"></el-input>
                <el-tree
                  class="project-tree"
                  ref="tree"
                  :check-on-click-node="false"
                  :data="setListData"
                  :default-expanded-keys="[defaultCaseSet]"
                  :empty-text="'请先添加一级用例集'"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  :highlight-current="true"
                  lazy
                  node-key="id"
                  @node-click="clickTree"
                  @node-drag-end="nodeDragEnd">
                    <span slot-scope="{ node, data }"
                          class="custom-tree-node"
                          @mouseenter="mouseenter(data)"
                          @mouseleave="mouseleave(data)">
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
                          ></i>

                          <el-dropdown-menu slot="dropdown">

                            <el-dropdown-item @click.native.stop="addCase(node, data)"
                            >{{ "添加用例" }}
                            </el-dropdown-item>

                            <el-dropdown-item @click.native.stop="showCaseSetDialog('add', node, data)"
                            >{{ '添加用例集' }}
                            </el-dropdown-item>

                            <el-dropdown-item @click.native.stop="showCaseSetDialog('edit', node, data)"
                            >{{ '修改当前用例集' }}
                            </el-dropdown-item>

                            <el-dropdown-item @click.native.stop="clickDeleteChild(node, data)"
                            >{{ "删除当前用例集" }}
                            </el-dropdown-item>

                            <el-dropdown-item @click.native.stop="showRunCaseSet(node, data)"
                            >{{ "运行当前用例集下的用例" }}
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
          :dataType="dataType"
          :currentSetId="currentSetId"
          :currentProjectId="currentProjectId"
        ></caseManage>
      </el-col>

    </el-row>

    <!-- 新增/修改用例集表单 -->
    <el-drawer
      :title="moduleDrawerStatus === 'add' ? '新增用例集' : '修改用例集'"
      size="40%"
      :wrapperClosable="false"
      :visible.sync="moduleDrawerIsShow"
      :direction="direction">
      <el-form
        ref="dataForm"
        :model="tempDataForm"
        label-position="left"
        label-width="100px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px">
        <el-form-item :label="'用例集名称'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="tempDataForm.name" placeholder="同一节点下，用例集名称不可重复"/>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="moduleDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="isShowLoading"
          @click=" moduleDrawerStatus === 'add' ? addCaseSet() : changCaseSet() ">
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <selectRunEnv
      :dataType="dataType"
    ></selectRunEnv>

    <runProcess
      :dataType="dataType"
    ></runProcess>

  </div>


</template>

<script>
import waves from "@/directive/waves";
import caseManage from '@/components/business/case'  // 用例管理组件
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件
import runProcess from '@/components/runProcess'  // 测试执行进度组件

import {getFindElementOption} from "@/utils/getConfig";
import {ellipsis, arrayToTree} from "@/utils/parseData"

import {apiMsgBelongTo, apiMsgBelongToStep, getAssertMapping} from "@/apis/apiTest/api";  // 接口引用
import {projectList as apiProjectList} from "@/apis/apiTest/project";
import {
  caseSetTree as apiCaseSetTree,
  caseSetRun as apiCaseSetRun,
  deleteCaseSet as apiDeleteCaseSet,
  postCaseSet as apiPostCaseSet,
  putCaseSet as apiPutCaseSet
} from "@/apis/apiTest/caseSet";

import {projectList as webUiProjectList} from "@/apis/webUiTest/project";
import {
  caseSetTree as webUiCaseSetTree,
  caseSetRun as webUiCaseSetRun,
  deleteCaseSet as webUiDeleteCaseSet,
  postCaseSet as webUiPostCaseSet,
  putCaseSet as webUiPutCaseSet
} from "@/apis/webUiTest/caseSet";

import {projectList as appUiProjectList} from "@/apis/appUiTest/project";
import {
  caseSetTree as appUiCaseSetTree,
  caseSetRun as appUiCaseSetRun,
  deleteCaseSet as appUiDeleteCaseSet,
  postCaseSet as appUiPostCaseSet,
  putCaseSet as appUiPutCaseSet
} from "@/apis/appUiTest/caseSet";
import {getConfigByName, getSkipIfTypeMapping} from "@/apis/config/config";
import {extractMappingList} from "@/apis/webUiTest/step";


export default {
  name: 'index',
  components: {
    caseManage,
    selectRunEnv,
    runProcess
  },
  props: ['dataType'],
  directives: {waves},
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      projectTab: '用例集列表',
      isShowLoading: false, // 用例集编辑框提交Loading
      filterText: '',      // 查询关键字
      projectListData: [],  // 项目列表
      currentProjectId: '',  // 当前选中的项目id
      setListData: [],  // 用例集列表
      currentSetId: '',  // 当前选中的用例集id，用于数据传递，获取用例列表
      currentSetIdForCommit: '',  // 当前选中的模块id，用于提交新增、修改
      currentLevelForCommit: 1,  // 当前选中的模块id，用于提交新增、修改
      currentParent: {}, // 当前选中的模块，用于提交新增、修改
      tempDataForm: {
        name: '',
        id: '',
        level: '',
        parent: '',
        project_id: '',
      },
      queryAddr: '',
      moduleDrawerIsShow: false,
      defaultCaseSet: {},
      moduleDrawerStatus: '',
      dropdownStatus: false,  // el-dropdown 的展开/隐藏状态
      currentLabel: '',  // 当前鼠标滑入的节点名
      runType: 1,
      runEnv: 'test',
      runSetData: undefined,
      projectListUrl: '',
      caseSetTreeUrl: '',
      caseSetRunUrl: '',
      deleteCaseSetUrl: '',
      postCaseSetUrl: '',
      putCaseSetUrl: ''
    }
  },

  methods: {

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
    sendSetTreeIsDone(caseSetTree) {
      this.$bus.$emit(this.$busEvents.treeIsDone, 'caseSet', JSON.parse(JSON.stringify(caseSetTree)))
    },

    // 获取用例集列表
    getSetList(projectId) {
      this.currentSetId = '' // 切换项目的时候，把选中用例集置为''
      this.currentSetIdForCommit = '' // 切换项目的时候，把选中用例集置为''
      this.currentParent = {}
      this.currentLevelForCommit = 1 // 切换项目的时候，把选中用例集置为''
      this.caseSetTreeUrl({'project_id': projectId}).then(response => {
        var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data
        this.setListData = arrayToTree(response_data, null)
        this.sendSetTreeIsDone(this.setListData)
      })
    },

    // 点击树
    clickTree(data, node, element) {
      this.currentSetId = data.id
      this.currentSetIdForCommit = data.id
      this.currentLevelForCommit = data.level
      this.currentParent = data
      this.$refs.tree.store.nodesMap[data.id].expanded = !this.$refs.tree.store.nodesMap[data.id].expanded // 展开/收缩节点
    },

    // 添加一级用例集
    addParentSet() {
      this.currentSetIdForCommit = ''
      this.currentLevelForCommit = 1
      this.currentParent = {}
      this.showCaseSetDialog('add')
    },

    // 鼠标滑入的时候，设置一个值，代表展示菜单
    mouseenter(data) {
      if (this.dropdownStatus === false) {
        this.currentSetIdForCommit = data.id
        this.currentParent = data
      }
      this.currentLabel = JSON.parse(JSON.stringify(data.name))
      data.name = ellipsis(data.name, 10)
      this.$set(data, 'showMenu', true);
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      data.name = this.currentLabel
      this.$set(data, 'showMenu', false);
    },

    // 打开用例集编辑框
    showCaseSetDialog(command, node, data) {
      this.moduleDrawerStatus = command
      this.tempDataForm.name = command === 'edit' ? data.name : ''
      this.moduleDrawerIsShow = true
    },

    // 添加用例集
    addCaseSet() {
      this.isShowLoading = true
      this.postCaseSetUrl({
        name: this.tempDataForm.name,
        id: '',
        level: this.currentLevelForCommit + 1,
        parent: this.currentSetIdForCommit || null,
        project_id: this.currentProjectId
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
            this.$refs.tree.store.nodesMap[this.currentParent.id].expanded = true  // 展开节点
          } else {
            this.setListData.push(response.data)
          }
          this.sendSetTreeIsDone(this.setListData)
        }
      })
    },

    // 修改用例集
    changCaseSet() {
      this.isShowLoading = true
      this.putCaseSetUrl({
        name: this.tempDataForm.name,
        id: this.currentParent.id,
        level: this.currentParent.level,
        parent: this.currentParent.parent,
        project_id: this.currentParent.project_id,
      }).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.moduleDrawerIsShow = false
          this.currentParent.name = response.data.name

          this.sendSetTreeIsDone(this.setListData)
        }
      })
    },

    // 关键字查询用例集
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },

    // 点击删除节点
    clickDeleteChild(node, data) {
      this.confirmBox(this.deleteChild, data, data.name)
    },

    // 删除节点
    deleteChild(data) {
      this.deleteCaseSetUrl({'id': data.id}).then(response => {
        if (this.showMessage(this, response)) {
          this.$refs.tree.remove(data)

          this.sendSetTreeIsDone(this.setListData)
        }
      })
    },

    // 添加用例
    addCase(node, data) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'caseInfo', 'add')
    },

    // 点击运行测试用例集
    showRunCaseSet(node, data) {
      this.runSetNode = node
      this.runSetData = data
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'set', true)
    },

    // 运行用例集的用例
    runCaseSet(runConf) {
      console.log('runConf: ', JSON.stringify(runConf))
      this.caseSetRunUrl({
        'id': this.runSetData ? this.runSetData.id : undefined,
        env_code: runConf.runEnv,
        is_async: runConf.runType,
        business_id: runConf.businessId,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        'trigger_type': 'page'
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.report_id)
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
      apiMsgBelongTo({addr: this.queryAddr}).then(response => {
        this.showMessage(this, response)
      })
    },

    // 获取接口使用情况
    getApiMsgBelongToStep() {
      apiMsgBelongToStep({addr: this.queryAddr}).then(response => {
        this.showMessage(this, response)
      })
    }

  },

  created() {
    if (this.dataType === 'api') {
      this.projectListUrl = apiProjectList
      this.caseSetTreeUrl = apiCaseSetTree
      this.caseSetRunUrl = apiCaseSetRun
      this.deleteCaseSetUrl = apiDeleteCaseSet
      this.postCaseSetUrl = apiPostCaseSet
      this.putCaseSetUrl = apiPutCaseSet
    } else if (this.dataType === 'webUi') {
      this.projectListUrl = webUiProjectList
      this.caseSetTreeUrl = webUiCaseSetTree
      this.caseSetRunUrl = webUiCaseSetRun
      this.deleteCaseSetUrl = webUiDeleteCaseSet
      this.postCaseSetUrl = webUiPostCaseSet
      this.putCaseSetUrl = webUiPutCaseSet
      getFindElementOption(this)  // 获取定位方式
    } else {
      this.projectListUrl = appUiProjectList
      this.caseSetTreeUrl = appUiCaseSetTree
      this.caseSetRunUrl = appUiCaseSetRun
      this.deleteCaseSetUrl = appUiDeleteCaseSet
      this.postCaseSetUrl = appUiPostCaseSet
      this.putCaseSetUrl = appUiPutCaseSet
      getFindElementOption(this)  // 获取定位方式
    }

    this.getProjectList()
  },

  mounted() {

    // 从后端获取数据类型映射
    getConfigByName({'name': 'data_type_mapping'}).then(response => {
      this.$busEvents.data.dataTypeMappingList = JSON.parse(response.data.value)
    })

    // 从后端获取响应对象数据源映射
    if (this.dataType === 'api'){
      getConfigByName({'name': 'response_data_source_mapping'}).then(response => {
        this.$busEvents.data.responseDataSourceMappingList = JSON.parse(response.data.value)
      })
    }

    // 从后端获取数据提取方式映射
    extractMappingList().then(response => {
      this.$busEvents.data.extractMappingList = response.data
    })

    // 从后端获取断言数方式映射
    getAssertMapping().then(response => {
      this.$busEvents.data.apiAssertMappingList = response.data
    })

    // 从后端获取跳过方式映射
    getSkipIfTypeMapping().then(response => {
      this.$busEvents.data.skipIfTypeMappingList = response.data
    })

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'selectRunEnv' && _runUnit === 'set') {
        this.runCaseSet(runDict)
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
};
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
