<template>

  <div class="app-container">

    <el-form label-width="150px" inline>
      <el-form-item :label="'选择项目：'" size="mini">
        <el-select
          v-model="currentProjectId"
          placeholder="选择项目"
          size="mini"
          style="width: 500px"
          filterable
          default-first-option
          @change="getModuleList"
        >
          <el-option v-for="item in projectListData" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>

        <el-button
          v-show="currentProjectId"
          type="primary"
          size="mini"
          style="margin-left: 10px"
          @click.native="addParentModule()"
        >为当前项目添加一级模块
        </el-button>

      </el-form-item>

    </el-form>

    <el-row>

      <!-- 第一列项目树 -->
      <el-col style="width: 20%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <el-tabs v-model="projectTab" class="table_padding table_project">
          <el-tab-pane :label="projectTab" :name="projectTab">
            <div class="custom-tree-container">
              <div class="block">
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" size="mini"></el-input>
                <el-scrollbar style="height:800px">
                  <el-tree
                    class="project-tree"
                    ref="tree"
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
                    @node-drag-end="nodeDragEnd">
                    <div slot-scope="{ node, data }"
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
                          style="padding-left: 5px;color: #409EFF;transform: rotate(90deg)"
                        ></i>
                        <el-dropdown-menu slot="dropdown">

                          <el-dropdown-item @click.native.stop="addApi(node, data)"
                          >{{ "添加页面" }}
                          </el-dropdown-item>

                          <el-dropdown-item @click.native.stop="showModuleDialog('add', node, data)"
                          >{{ '添加子模块' }}
                          </el-dropdown-item>

                          <el-dropdown-item @click.native.stop="showModuleDialog('edit', node, data)"
                          >{{ '修改当前模块' }}
                          </el-dropdown-item>

                          <el-dropdown-item @click.native.stop="clickDeleteChild(node, data)"
                          >{{ "删除当前模块" }}
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
      <el-col style="width: 79%; margin-left: 5px">
        <!-- 页面管理组件 -->
        <pageManage
          :currentModuleId="currentModuleId"
          :currentProjectId="currentProjectId"
        ></pageManage>
      </el-col>

    </el-row>

    <!-- 新增/修改模块表单 -->
    <el-drawer
      :title="moduleDrawerStatus === 'add' ? '新增模块' : '修改模块'"
      size="40%"
      :wrapperClosable="false"
      :visible.sync="moduleDrawerIsShow"
      :direction="direction">
      <el-form
        ref="dataForm"
        :model="tempDataForm"
        label-position="left"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px">
        <el-form-item :label="'模块名称'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="tempDataForm.name" placeholder="同一节点下，模块名称不可重复"/>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="moduleDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="isShowLoading"
          @click=" moduleDrawerStatus === 'add' ? addModule() : changModule() ">
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

  </div>


</template>

<script>
import waves from "@/directive/waves";
import pageManage from '@/views/uiTest/pages'  // 页面管理组件

import {ellipsis, arrayToTree} from "@/utils/parseData"

import {projectList} from "@/apis/uiTest/project";
import {moduleTree, deleteModule, postModule, putModule} from "@/apis/uiTest/module";


export default {
  name: 'index',
  components: {
    pageManage
  },
  directives: {waves},
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      projectTab: '模块列表',  // 项目tab的title
      filterText: '',  // 查询关键字
      isShowLoading: false, // 模块编辑框提交Loading
      projectListData: [],  // 项目列表
      currentProjectId: '',  // 当前选中的项目id
      moduleListData: [],  // 模块列表
      currentModuleId: '',  // 当前选中的模块id，用于数据传递，获取接口列表
      currentModuleIdForCommit: '',  // 当前选中的模块id，用于提交新增、修改
      currentLevelForCommit: 1,  // 当前选中的模块id，用于提交新增、修改
      currentParent: {}, // 当前选中的模块，用于提交新增、修改
      tempDataForm: {
        name: '',
        id: '',
        level: '',
        parent: '',
        project_id: '',
      },
      moduleDrawerIsShow: false,
      moduleDrawerStatus: '',
      defaultModule: {},

      // 当前鼠标滑入的节点名
      currentLabel: ''
    }
  },

  created() {
    this.getProjectList()
  },

  methods: {

    // el-dropdown 的展开/隐藏状态
    changeDropdownStatus(status) {
      this.dropdownStatus = status
    },

    // 获取项目列表
    getProjectList() {
      projectList().then(response => {
        this.projectListData = response.data.data
      })
    },

    // 获取模块列表
    getModuleList(projectId) {
      this.currentModuleId = '' // 切换项目的时候，把选中模块置为''
      this.currentModuleIdForCommit = '' // 切换项目的时候，把选中模块置为''
      this.currentParent = {}
      this.currentLevelForCommit = 1 // 切换项目的时候，把选中模块置为''
      moduleTree({'project_id': projectId}).then(response => {
        var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data
        this.moduleListData = arrayToTree(response_data, null)

        this.sendModuleTreeIsDone(this.moduleListData)
      })
    },

    // 点击树
    clickTree(data, node, element) {
      this.currentModuleId = data.id
      this.currentModuleIdForCommit = data.id
      this.currentLevelForCommit = data.level
      this.currentParent = data
      this.$refs.tree.store.nodesMap[data.id].expanded = !this.$refs.tree.store.nodesMap[data.id].expanded // 展开/收缩节点
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
      this.$set(data, 'showMenu', true);
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      data.name = this.currentLabel
      this.$set(data, 'showMenu', false);
    },

    // 模块编辑框
    showModuleDialog(command, node, data) {
      this.moduleDrawerStatus = command
      this.tempDataForm.name = command === 'edit' ? data.name : ''
      this.moduleDrawerIsShow = true
    },

    // 添加模块
    addModule() {
      this.isShowLoading = true
      postModule({
        name: this.tempDataForm.name,
        id: '',
        level: this.currentLevelForCommit + 1,
        parent: this.currentModuleIdForCommit || null,
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
            this.moduleListData.push(response.data)
          }
          this.sendModuleTreeIsDone(this.moduleListData)
        }
      })
    },

    // 修改模块
    changModule() {
      this.isShowLoading = true
      putModule({
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
          this.sendModuleTreeIsDone(this.moduleListData)
        }
      })
    },

    // 关键字查询模块
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
      deleteModule({'id': data.id}).then(response => {
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

    // 添加接口
    addApi(node, data) {
      // 由于 body 组件监听时会解析请求体，所以这给个默认值
      this.$bus.$emit(this.$busEvents.ui.uiPageDrawerStatus, 'add', {
        data_type: 'json',
        data_json: {},
        data_form: [{key: null, data_type: null, remark: null, value: null}]
      })
    },

    // 发送模块树数据
    sendModuleTreeIsDone(moduleTree){
      this.$bus.$emit(this.$busEvents.ui.uiModuleTreeIsDone, JSON.parse(JSON.stringify(moduleTree)))
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
};
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
