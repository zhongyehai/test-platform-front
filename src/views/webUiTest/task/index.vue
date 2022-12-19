<template>
  <div class="app-container">
    <el-row>

      <!-- 服务树 -->
      <el-col style="width: 15%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <!-- 服务列表树组件 -->
        <projectTreeView
          ref="projectTree"
          :busEventClickTree="$busEvents.ui.uiProjectTreeChoiceProject"
          :busEventClickMenu="$busEvents.ui.uiTaskDrawerIsShow"
          :sourceType="'web_ui'"
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

              <el-table-column prop="cron" align="center" label="cron表达式" min-width="35%"></el-table-column>

              <el-table-column align="center" label="是否启用" min-width="15%" :render-header="renderHeader">
                <template slot-scope="scope">
                  <el-switch
                    :inactive-value="0"
                    :active-value="1"
                    :disabled="scope.row.taskIsDisabled"
                    v-model="scope.row.status"
                    @change="changeStatus(scope.row)"></el-switch>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true align="center" prop="create_user" label="最后修改人"
                               min-width="12%">
                <template slot-scope="scope">
                  <span>{{ parseUser(scope.row.update_user) }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" label="操作" min-width="16%">
                <template slot-scope="scope">

                  <!-- 运行任务 -->
                  <el-button
                    type="text"
                    slot="reference"
                    icon="el-icon-video-play"
                    :loading="scope.row.runButtonIsLoading"
                    @click="clickRunTask(scope.row)"
                  ></el-button>

                  <!-- 修改任务 -->
                  <el-button
                    type="text"
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
                    v-model="scope.row.copyTaskPopoverIsShow">
                    <p>复制此任务并生成新的任务?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelCopyTaskPopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="copy(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      type="text"
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
                      <el-button size="mini" type="text" @click="cancelDeleteTaskPopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="delTask(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      style="color: red"
                      type="text"
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
      :callBackEvent="callBackEvent"
      :event="runEvent"
    ></selectRunEnv>

    <runProcess
      :runType="'webUi'"
      :busName="$busEvents.data.showRunProcessByIndex"
    ></runProcess>

    <taskDrawer></taskDrawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import projectTreeView from '@/components/uiTest/projectTree'
import Pagination from '@/components/Pagination'
import taskDrawer from "@/views/webUiTest/task/drawer";
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件
import runProcess from '@/components/runProcess'  // 测试执行进度组件

import {taskList, disableTask, enableTask, runTask, deleteTask, copyTask, taskSort} from '@/apis/webUiTest/task'
import {reportIsDone} from "@/apis/webUiTest/report";
import {userList} from "@/apis/system/user";
import {runTestTimeOutMessage} from "@/utils/message";
import {getRunTimeout} from "@/utils/getConfig";  // 初始化超时时间

export default {
  name: "index",
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
      userList: [],
      userDict: {},

      currentTask: {},
      runEvent: 'runUiTaskEventOnIndex',
      callBackEvent: 'runUiTaskOnIndex'
    }
  },


  methods: {
    // 获取用户信息，同步请求
    async getUserList() {
      let response = await userList()
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 进入编辑
    editTask(row) {
      if (row.status === 0) {
        this.$bus.$emit(this.$busEvents.ui.uiTaskDrawerIsShow, 'update', JSON.parse(JSON.stringify(row)))
      }
    },

    cancelCopyTaskPopover(task) {
      this.$set(task, 'copyTaskPopoverIsShow', false)
    },

    cancelDeleteTaskPopover(task) {
      this.$set(task, 'deletePopoverIsShow', false)
    },

    // 复制任务
    copy(task) {
      this.$set(task, 'copyTaskPopoverIsShow', false)
      this.$set(task, 'copyButtonIsLoading', true)
      copyTask({'id': task.id}).then(response => {
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
      this.$bus.$emit(this.runEvent, 'webUi')
    },

    // 运行任务
    run(runConf) {
      this.$set(this.currentTask, 'runButtonIsLoading', true)
      runTask({
        id: this.currentTask.id,
        env: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        'trigger_type': 'page'
      }).then(response => {
        this.$set(this.currentTask, 'runButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.data.showRunProcessByIndex, response.data.report_id)
        }
      })
    },

    // 删除任务
    delTask(task) {
      this.$set(task, 'deletePopoverIsShow', false)
      this.$set(task, 'deleteLoadingIsShow', true)
      deleteTask({id: task.id}).then(response => {
        this.$set(task, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getTaskList()
        }
      })
    },

    // 修改定时任务状态
    changeStatus(task) {
      this.$set(task, 'taskIsDisabled', true)
      if (task.status === 1) {
        enableTask({id: task.id}).then(response => {
          this.$set(task, 'taskIsDisabled', false)
          if (this.showMessage(this, response)) {
            this.getTaskList()
          }
        })
      } else {
        disableTask({id: task.id}).then(response => {
          this.$set(task, 'taskIsDisabled', false)
          if (this.showMessage(this, response)) {
            this.getTaskList()
          }
        })
      }
    },

    // 获取任务列表
    getTaskList() {
      taskList({
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
          taskSort({
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

  mounted() {
    this.getUserList()

    getRunTimeout(this)  // 初始化等待用例运行超时时间

    this.$bus.$on(this.$busEvents.ui.uiTaskDrawerIsCommit, (status) => {
      this.getTaskList()
    })

    // 服务树选中项事件
    this.$bus.$on(this.$busEvents.ui.uiProjectTreeChoiceProject, (project) => {
      this.projectId = project.id
      this.getTaskList()
    })

    this.$bus.$on(this.callBackEvent, (runDict) => {
      this.run(runDict)
    })
  },

  created() {

    this.oldList = this.taskList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.callBackEvent)
    this.$bus.$off(this.$busEvents.ui.uiTaskDrawerIsCommit)
    this.$bus.$off(this.$busEvents.ui.uiProjectTreeChoiceProject)
  }
}
</script>

<style scoped>

</style>
