<template>
  <div class="app-container">
    <el-row>

      <!-- 服务树 -->
      <el-col style="width: 15%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <!-- 服务列表树组件 -->
        <projectTreeView
          ref="projectTree"
          :dataType="dataType"
          :menuName="'添加任务'"
          :labelWidth="5"
        ></projectTreeView>
      </el-col>

      <!-- 定时任务 -->
      <el-col style="width: 85%">
        <!-- 定时任务列表 -->
        <el-tabs v-model="taskTab" class="table_padding" style="margin-left: 5px">
          <el-tab-pane label="定时任务列表" :name="taskTab">
            <el-table
              ref="taskTable"
              v-loading="tableLoadingIsShow"
              element-loading-text="正在排序中"
              element-loading-spinner="el-icon-loading"
              :data="taskList"
              row-key="id"
              stripe
            >
              <el-table-column prop="num" label="序号" align="center" min-width="7%">
                <template slot-scope="scope">
                  <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="name" align="center" label="任务名称" min-width="25%">
                <template slot-scope="scope">
                  <span> {{ scope.row.name }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="cron" label="cron表达式" align="center" min-width="35%">
                <template slot-scope="scope">
                  <span> {{ scope.row.cron }} </span>
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="是否启用"
                min-width="15%"
                :render-header="renderHeader">
                <template slot-scope="scope">
                  <el-switch
                    :inactive-value="0"
                    :active-value="1"
                    :disabled="scope.row.taskIsDisabled"
                    v-model="scope.row.status"
                    @change="changeStatus(scope.row)"></el-switch>
                </template>
              </el-table-column>

              <el-table-column label="操作" align="center" min-width="16%">
                <template slot-scope="scope">

                  <!-- 运行任务 -->
                  <el-button
                    type="text"
                    size="mini"
                    slot="reference"
                    icon="el-icon-video-play"
                    :loading="scope.row.runButtonIsLoading"
                    @click="clickRunTask(scope.row)"
                  ></el-button>

                  <!-- 修改任务 -->
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-edit"
                    style="margin-right: 10px"
                    :disabled="scope.row.status === 1"
                    @click.native="editTask(scope.row)"></el-button>

                  <!-- 复制任务 -->
                  <el-popover
                    :ref="scope.row.id"
                    placement="top"
                    style="margin-right: 10px"
                    popper-class="down-popover"
                    v-model="scope.row.copyPopoverIsShow">
                    <p>复制此任务并生成新的任务?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="copy(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      icon="el-icon-document-copy"
                      :loading="scope.row.copyButtonIsLoading"
                    ></el-button>
                  </el-popover>

                  <!-- 删除任务 -->
                  <el-popover
                    :ref="scope.row.id"
                    placement="top"
                    popper-class="down-popover"
                    v-model="scope.row.deletePopoverIsShow">
                    <p>确定删除【{{ scope.row.name }}】?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="delTask(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      style="color: red"
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      :disabled="scope.row.status === 1"
                      :loading="scope.row.deleteLoadingIsShow"
                    ></el-button>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="taskTotal>0"
              :total="taskTotal"
              :page.sync="pageNum"
              :limit.sync="pageSize"
              @pagination="getTaskList"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <selectRunEnv
      :dataType="dataType"
    ></selectRunEnv>

    <runProcess
      :dataType="dataType"
    ></runProcess>

    <taskDrawer
      :dataType="dataType"
    ></taskDrawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import projectTreeView from '@/components/Trees/projectTree.vue'
import Pagination from '@/components/Pagination/index.vue'
import taskDrawer from "@/components/business/task/drawer.vue";
import selectRunEnv from '@/components/selectRunEnv.vue'  // 环境选择组件
import runProcess from '@/components/runProcess.vue'  // 测试执行进度组件

import {
  taskList as apiTaskList,
  disableTask as apiDisableTask,
  enableTask as apiEnableTask,
  runTask as apiRunTask,
  deleteTask as apiDeleteTask,
  copyTask as apiCopyTask,
  taskSort as apiTaskSort
} from '@/apis/apiTest/task'

import {
  taskList as webUiTaskList,
  disableTask as webUiDisableTask,
  enableTask as webUiEnableTask,
  runTask as webUiRunTask,
  deleteTask as webUiDeleteTask,
  copyTask as webUiCopyTask,
  taskSort as webUiTaskSort
} from '@/apis/webUiTest/task'

import {
  taskList as appUiTaskList,
  disableTask as appUiDisableTask,
  enableTask as appUiEnableTask,
  runTask as appUiRunTask,
  deleteTask as appUiDeleteTask,
  copyTask as appUiCopyTask,
  taskSort as appUiTaskSort
} from '@/apis/appUiTest/task'

export default {
  name: "index",
  props: ["dataType"],
  components: {Pagination, projectTreeView, taskDrawer, selectRunEnv, runProcess},
  data() {
    return {
      tableLoadingIsShow: false,
      taskTab: 'taskTab',
      taskList: [],
      projectId: '',
      taskTotal: 0,
      pageNum: 0,
      pageSize: 20,

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],

      currentTask: {},
      runEvent: 'runTaskEventOnIndex',
      callBackEvent: 'runTaskOnIndex',

      taskListUrl: '',
      disableTaskUrl: '',
      enableTaskUrl: '',
      runTaskUrl: '',
      deleteTaskUrl: '',
      copyTaskUrl: '',
      taskSortUrl: ''
    }
  },


  methods: {

    // 进入编辑
    editTask(row) {
      if (row.status === 0) {
        this.$bus.$emit(this.$busEvents.drawerIsShow, 'taskInfo', 'update', JSON.parse(JSON.stringify(row)))
      }
    },

    cancelCopyPopover(task) {
      this.$set(task, 'copyPopoverIsShow', false)
    },

    cancelDeletePopover(task) {
      this.$set(task, 'deletePopoverIsShow', false)
    },

    // 复制任务
    copy(task) {
      this.$set(task, 'copyPopoverIsShow', false)
      this.$set(task, 'copyButtonIsLoading', true)
      this.copyTaskUrl({'id': task.id}).then(response => {
        this.$set(task, 'copyButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.taskList.push(response.data)
          this.editTask(response.data)
        }
      })
    },

    // 点击运行任务
    clickRunTask(task) {
      this.currentTask = task
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'taskIndex', true)
    },

    // 运行任务
    run(runConf) {
      this.$set(this.currentTask, 'runButtonIsLoading', true)
      this.runTaskUrl({
        id: this.currentTask.id,
        env: runConf.runEnv,
        is_async: runConf.runType,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        browser: runConf.browser,
        'trigger_type': 'page'
      }).then(response => {
        this.$set(this.currentTask, 'runButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.report_id)
        }
      })
    },

    // 删除任务
    delTask(task) {
      this.$set(task, 'deletePopoverIsShow', false)
      this.$set(task, 'deleteLoadingIsShow', true)
      this.deleteTaskUrl({id: task.id}).then(response => {
        this.$set(task, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 修改定时任务状态，el-switch组件是先改变状态，再发送请求
    changeStatus(task) {
      this.$set(task, 'taskIsDisabled', true)
      if (task.status === 1) {
        this.enableTaskUrl({id: task.id}).then(response => {
          this.$set(task, 'taskIsDisabled', false)
          if (this.showMessage(this, response)) {
            this.getTaskList()
          }
        })
      } else {
        this.disableTaskUrl({id: task.id}).then(response => {
          this.$set(task, 'taskIsDisabled', false)
          if (this.showMessage(this, response)) {
            this.getTaskList()
          }
        })
      }
    },

    // 获取任务列表
    getTaskList() {
      this.taskListUrl({
        projectId: this.projectId,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then(response => {
        this.taskList = response.data.data
        this.taskTotal = response.data.total

        this.oldList = this.taskList.map(v => v.id)
        this.newList = this.oldList.slice()
      })
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.taskTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.taskList.splice(evt.oldIndex, 1)[0]
          this.taskList.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          this.taskSortUrl({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize,
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    },
    renderHeader(h, {column}) {
      // 悬浮提示的文字内容
      const info = '启用中的任务才会定时执行；禁用中的任务才支持修改'
      return h(
        'div',
        [
          h('span', column.label),
          // placement指定悬浮显示方向
          h('el-tooltip', {props: {placement: 'top', effect: 'light'}},
            [
              // style 调文字颜色样式
              h('div', {slot: 'content', style: {whiteSpace: 'normal', color: 'blue'}}, info),
              // el-icon-warning是element图标, style 调图标颜色 样式
              h('i', {class: 'el-icon-warning', style: 'color: #409EFF; margin-left: 5px;'})
            ]
          )
        ]
      )
    },
  },

  created() {
    if (this.dataType === "api") {
      this.taskListUrl = apiTaskList
      this.disableTaskUrl = apiDisableTask
      this.enableTaskUrl = apiEnableTask
      this.runTaskUrl = apiRunTask
      this.deleteTaskUrl = apiDeleteTask
      this.copyTaskUrl = apiCopyTask
      this.taskSortUrl = apiTaskSort
    } else if (this.dataType === "webUi") {
      this.taskListUrl = webUiTaskList
      this.disableTaskUrl = webUiDisableTask
      this.enableTaskUrl = webUiEnableTask
      this.runTaskUrl = webUiRunTask
      this.deleteTaskUrl = webUiDeleteTask
      this.copyTaskUrl = webUiCopyTask
      this.taskSortUrl = webUiTaskSort
    } else {
      this.taskListUrl = appUiTaskList
      this.disableTaskUrl = appUiDisableTask
      this.enableTaskUrl = appUiEnableTask
      this.runTaskUrl = appUiRunTask
      this.deleteTaskUrl = appUiDeleteTask
      this.copyTaskUrl = appUiCopyTask
      this.taskSortUrl = appUiTaskSort
    }

    this.oldList = this.taskList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  mounted() {

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'taskInfo') {
        this.getTaskList()
      } else if (_type === 'selectRunEnv' && _runUnit === 'taskIndex') {
        this.run(runDict)
      }
    })

    // 服务树选中项事件
    this.$bus.$on(this.$busEvents.treeIsChoice, (_type, project) => {
      if (_type === 'project') {
        this.projectId = project.id
        this.getTaskList()
      }
    })

  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.treeIsChoice)
  }
}
</script>

<style scoped>

</style>
