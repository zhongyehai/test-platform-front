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
              <el-table-column prop="num" label="序号" min-width="7%">
                <template slot-scope="scope">
                  <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="name" label="任务名称" min-width="25%">
                <template slot-scope="scope">
                  <span> {{ scope.row.name }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="cron" label="cron表达式" min-width="35%"></el-table-column>

              <el-table-column align="center" label="是否启用" min-width="15%">
                <template slot-scope="scope">
                  <el-switch
                    :disabled="scope.row.taskIsDisabled"
                    v-model="scope.row.status === 1"
                    @change="changeStatus(scope.row)"></el-switch>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="9%">
                <template slot-scope="scope">
                  <span>{{ parseUser(scope.row.create_user) }}</span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="create_user" label="最后修改人" min-width="12%">
                <template slot-scope="scope">
                  <span>{{ parseUser(scope.row.update_user) }}</span>
                </template>
              </el-table-column>

              <el-table-column label="操作" min-width="16%">
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
                  <el-popconfirm
                    placement="top"
                    hide-icon
                    style="margin-right: 10px"
                    title="复制此任务并生成新的任务？"
                    confirm-button-text='确认'
                    cancel-button-text='取消'
                    @onConfirm="copy(scope.row)"
                  >
                    <el-button
                      type="text"
                      slot="reference"
                      icon="el-icon-document-copy"
                      :loading="scope.row.copyButtonIsLoading"
                    ></el-button>
                  </el-popconfirm>

                  <!-- 删除任务 -->
                  <el-popconfirm
                    placement="top"
                    hide-icon
                    style="margin-right: 10px"
                    :title="`确定删除【${scope.row.name}】?`"
                    confirm-button-text='确认'
                    cancel-button-text='取消'
                    @onConfirm="delTask(scope.row)"
                  >
                    <el-button
                      slot="reference"
                      type="text"
                      style="color: red"
                      icon="el-icon-delete"
                      :disabled="scope.row.status === 1"
                      :loading="scope.row.deleteLoadingIsShow"
                    ></el-button>
                  </el-popconfirm>
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

    <taskDrawer></taskDrawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import projectTreeView from '@/components/uiTest/projectTree'
import Pagination from '@/components/Pagination'
import taskDrawer from "@/views/uiTest/task/drawer";
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件

import {taskList, disableTask, enableTask, runTask, deleteTask, copyTask, taskSort} from '@/apis/uiTest/task'
import {reportIsDone} from "@/apis/uiTest/report";
import {userList} from "@/apis/user/user";
import {runTestTimeOutMessage} from "@/utils/message";
import {getRunTimeout} from "@/utils/getConfig";  // 初始化超时时间

export default {
  name: "index",
  components: {Pagination, projectTreeView, taskDrawer, selectRunEnv},
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

    // 复制任务
    copy(task) {
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
    clickRunTask(task){
      this.currentTask = task
      this.$bus.$emit(this.runEvent, true)
    },

    // 运行任务
    run(runData) {
      this.$set(this.currentTask, 'runButtonIsLoading', true)
      runTask({id: this.currentTask.id, env: runData.runEnv, is_async: runData.runType}).then(runResponse => {
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
          // 已出结果，则停止查询，展示测试报告
          var that = this
          // 初始化运行超时时间
          var runTimeoutCount = Number(this.$busEvents.runTimeout) * 1000 / 3000
          var queryCount = 1
          var timer = setInterval(function () {
            if (queryCount <= runTimeoutCount) {
              reportIsDone({'id': runResponse.data.report_id}).then(queryResponse => {
                if (queryResponse.data === 1) {
                  that.$set(that.currentTask, 'runButtonIsLoading', false)
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.$set(that.currentTask, 'runButtonIsLoading', false)
              that.$notify(runTestTimeOutMessage(that));
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // 删除任务
    delTask(task) {
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
        disableTask({id: task.id}).then(response => {
          this.$set(task, 'taskIsDisabled', false)
          if (this.showMessage(this, response)) {
            this.getTaskList()
          }
        })
      } else {
        enableTask({id: task.id}).then(response => {
          this.$set(task, 'taskLoadingIsShow', false)
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
    }
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
