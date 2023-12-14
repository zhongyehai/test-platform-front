<template>
  <div class="app-container">
    <el-row>

      <!-- 服务树 -->
      <el-col style="width: 15%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <!-- 服务列表树组件 -->
        <projectTreeView
          ref="projectTree"
          :data-type="dataType"
          :label-width="5"
        />
        <!--        :menu-name="'添加任务'"-->
      </el-col>

      <!-- 定时任务 -->
      <el-col style="width: 85%">
        <!-- 定时任务列表 -->
        <el-tabs v-model="taskTab" class="table_padding" style="margin-left: 5px">
          <!--          <el-tab-pane label="定时任务列表" :name="taskTab">-->
          <el-tab-pane name="taskTab">
            <template slot="label">
              <span> 定时任务列表 </span>
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>点击添加定时任务</div>
                <el-button
                  v-show="projectId"
                  slot="reference"
                  type="text"
                  style="margin-left: 10px"
                  icon="el-icon-plus"
                  @click="showAddTaskDrawer()"
                />
              </el-popover>
            </template>

            <el-table
              ref="taskTable"
              v-loading="tableLoadingIsShow"
              size="mini"
              element-loading-text="正在获取数据..."
              element-loading-spinner="el-icon-loading"
              :data="taskList"
              row-key="id"
              stripe
              @cell-dblclick="cellDblclick"
            >
              <el-table-column prop="num" label="序号" align="center" min-width="7%">
                <template slot-scope="scope">
                  <span> {{ (page_num - 1) * page_size + scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip prop="name" align="center" label="任务名称" min-width="25%">
                <template slot-scope="scope">
                  <span> {{ scope.row.name }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="cron" label="cron表达式" align="center" min-width="35%">
                <template slot-scope="scope">
                  <span> {{ scope.row.cron }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="cron" label="节假日/调休日" align="center" min-width="15%">
                <template slot-scope="scope">
                  <span> {{ scope.row.skip_holiday === 1 ? "跳过": "不跳过" }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="cron" label="合并通知" align="center" min-width="10%">
                <template slot="header">
                  <span>合并通知</span>
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <div slot="content">
                      <div>1、不合并通知：达到触发发送通知的条件时，每个环境都会发一份通知</div>
                      <div>2、合并通知：达到触发发送通知的条件时，汇总每个环境的通知，只通知一次</div>
                      <div>注：当选择了多个环境时，才会出现此选项</div>
                    </div>
                    <span><i style="color: #409EFF" class="el-icon-question" /></span>
                  </el-tooltip>
                </template>
                <template slot-scope="scope">
                  <span> {{ scope.row.merge_notify === 1 ? "合并": "不合并" }} </span>
                </template>
              </el-table-column>

              <el-table-column align="center" min-width="15%">
                <template slot="header">
                  <span>是否启用</span>
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <div slot="content">
                      <div>1: 启用中的任务才会定时执行</div>
                      <div>2: 禁用中的任务才支持修改</div>
                    </div>
                    <span><i style="color: #409EFF" class="el-icon-question" /></span>
                  </el-tooltip>
                </template>
                <template slot-scope="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :inactive-value="0"
                    :active-value="1"
                    @change="changeStatus(scope.row)"
                  />
                </template>
              </el-table-column>

              <el-table-column label="操作" align="center" min-width="20%">
                <template slot-scope="scope">

                  <!-- 运行任务 -->
                  <el-button
                    slot="reference"
                    type="text"
                    size="mini"
                    :loading="scope.row.runButtonIsLoading"
                    @click="clickRunTask(scope.row)"
                  >运行</el-button>

                  <!-- 修改任务 -->
                  <el-button
                    type="text"
                    size="mini"
                    style="margin-right: 10px"
                    :disabled="scope.row.status === 1"
                    @click.native="editTask(scope.row)"
                  >修改</el-button>

                  <!-- 复制任务 -->
                  <el-popover
                    :ref="scope.row.id"
                    v-model="scope.row.copyPopoverIsShow"
                    placement="top"
                    style="margin-right: 10px"
                    popper-class="down-popover"
                  >
                    <p>复制此任务并生成新的任务?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="copy(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                    >复制</el-button>
                  </el-popover>

                  <!-- 删除任务 -->
                  <el-popover
                    :ref="scope.row.id"
                    v-model="scope.row.deletePopoverIsShow"
                    placement="top"
                    popper-class="down-popover"
                  >
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
                      :disabled="scope.row.status === 1"
                    >删除</el-button>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="taskTotal>0"
              :total="taskTotal"
              :page.sync="page_num"
              :limit.sync="page_size"
              @pagination="getTaskList"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <selectRunEnv
      :data-type="dataType"
    />

    <runProcess
      :data-type="dataType"
    />

    <taskDrawer
      :data-type="dataType"
      :curren-project-id="projectId"
    />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import projectTreeView from '@/components/Trees/projectTree.vue'
import Pagination from '@/components/Pagination/index.vue'
import taskDrawer from '@/components/business/task/drawer.vue'
import selectRunEnv from '@/components/selectRunEnv.vue' // 环境选择组件
import runProcess from '@/components/runProcess.vue' // 测试执行进度组件

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
  name: 'Index',
  components: { Pagination, projectTreeView, taskDrawer, selectRunEnv, runProcess },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType'],
  data() {
    return {
      tableLoadingIsShow: false,
      taskTab: 'taskTab',
      taskList: [],
      project: '',
      projectId: '',
      taskTotal: 0,
      page_num: 0,
      page_size: 20,

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      projectBusinessId: '',
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

  created() {
    if (this.dataType === 'api') {
      this.taskListUrl = apiTaskList
      this.disableTaskUrl = apiDisableTask
      this.enableTaskUrl = apiEnableTask
      this.runTaskUrl = apiRunTask
      this.deleteTaskUrl = apiDeleteTask
      this.copyTaskUrl = apiCopyTask
      this.taskSortUrl = apiTaskSort
    } else if (this.dataType === 'webUi') {
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
        this.project = project
        this.projectId = project.id
        this.projectBusinessId = project.business_id
        this.getTaskList()
      }
    })
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.treeIsChoice)
  },

  methods: {

    showAddTaskDrawer() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'taskInfo', 'add', this.project)
    },

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      this.$copyText(typeof (data) === 'string' ? data : JSON.stringify(data)).then(
        function(e) {
          that.$message.success('复制成功')
        }
      )
    },

    // 进入编辑
    editTask(row) {
      if (row.status === 0) {
        this.$bus.$emit(this.$busEvents.drawerIsShow, 'taskInfo', 'update', row.id)
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
      this.tableLoadingIsShow = true
      this.copyTaskUrl({ id: task.id }).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 点击运行任务
    clickRunTask(task) {
      this.currentTask = task
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'taskIndex', true, this.projectBusinessId)
    },

    // 运行任务
    run(runConf) {
      this.$set(this.currentTask, 'runButtonIsLoading', true)
      this.runTaskUrl({
        id: this.currentTask.id,
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        browser: runConf.browser,
        no_reset: runConf.noReset,
        'trigger_type': 'page'
      }).then(response => {
        this.$set(this.currentTask, 'runButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id, response.data.report_id)
        }
      })
    },

    // 删除任务
    delTask(task) {
      this.$set(task, 'deletePopoverIsShow', false)
      this.tableLoadingIsShow = true
      this.deleteTaskUrl({ id: task.id }).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 修改定时任务状态，el-switch组件是先改变状态，再发送请求
    changeStatus(task) {
      if (task.status === 1) {
        this.tableLoadingIsShow = true
        this.enableTaskUrl({ id: task.id }).then(response => {
          this.tableLoadingIsShow = false
          if (this.showMessage(this, response)) {
            this.getTaskList()
          }
        })
      } else {
        this.tableLoadingIsShow = true
        this.disableTaskUrl({ id: task.id }).then(response => {
          this.tableLoadingIsShow = false
          if (this.showMessage(this, response)) {
            this.getTaskList()
          }
        })
      }
    },

    // 获取任务列表
    getTaskList() {
      this.tableLoadingIsShow = true
      this.taskListUrl({ project_id: this.projectId, page_num: this.page_num, page_size: this.page_size, detail: true
      }).then(response => {
        this.tableLoadingIsShow = false
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
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.taskList.splice(evt.oldIndex, 1)[0]
          this.taskList.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          this.taskSortUrl({ id_list: this.newList, page_num: this.page_num, page_size: this.page_size }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
