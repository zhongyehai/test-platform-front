<template>
  <el-drawer
    :title=" tempTask.id ? '修改定时任务' : '新增定时任务'"
    size="60%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <el-form label-width="100px" style="margin-left: 20px;margin-right: 20px">

      <el-tabs v-model="activeName">
        <el-tab-pane label="任务信息" name="taskInfo">
          <el-form-item label="任务名称" size="mini" class="is-required">
            <el-input v-model="tempTask.name" auto-complete="off">
            </el-input>
          </el-form-item>

          <!-- 服务选择 -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="选择服务" class="is-required">
                <el-select
                  v-model="projectSelectedId"
                  placeholder="请选择服务"
                  size="mini"
                  filterable
                  default-first-option
                  style="width: 90%"
                  :disabled="true"
                >
                  <el-option
                    v-for="(item) in projectLists"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
                <el-popconfirm
                  placement="top"
                  title="若没有选择用例集，则默认运行此服务下的所有用例"
                  hide-icon>
                  <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                </el-popconfirm>
              </el-form-item>
            </el-col>

            <!-- 选择环境 -->
            <el-col :span="12">
              <el-form-item label="选择环境" class="is-required">
                <environmentSelectorView
                  :choice_environment="tempTask.env"
                  ref="environmentSelectorView"
                ></environmentSelectorView>
                <el-popconfirm
                  placement="top"
                  title="触发次定时任务时，会以此处选择的环境来执行，请确保此任务涉中及到的所有服务都设置了当前选中环境的域名"
                  hide-icon>
                  <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                </el-popconfirm>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="发送报告" class="is-required">
            <el-radio v-model="tempTask.is_send" label="1">不发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="2">始终发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="3">仅有不通过用例时发送</el-radio>
          </el-form-item>

          <el-form-item v-show="tempTask.is_send !== '1'" class="is-required" label="接收方式">
            <el-radio v-model="tempTask.send_type" label="all">都接收</el-radio>
            <el-radio v-model="tempTask.send_type" label="we_chat">仅企业微信群</el-radio>
            <el-radio v-model="tempTask.send_type" label="ding_ding">仅钉钉群</el-radio>
            <el-radio v-model="tempTask.send_type" label="email">仅邮件</el-radio>
            <div v-show="tempTask.send_type === 'we_chat'">
              <el-form-item label="机器人地址" class="is-required">
                <el-input
                  type="textarea"
                  size="mini"
                  autosize
                  v-model="tempTask.we_chat"
                  placeholder="企业微信机器人地址"></el-input>
              </el-form-item>
            </div>
            <div v-show="tempTask.send_type === 'ding_ding'">
              <el-form-item label="机器人地址" class="is-required">
                <el-input
                  type="textarea"
                  size="mini"
                  autosize
                  v-model="tempTask.ding_ding"
                  placeholder="钉钉机器人地址"></el-input>
              </el-form-item>
            </div>
            <div v-show="tempTask.send_type === 'email'">
              <el-form-item label="邮箱服务器" class="is-required">
                <emailServerSelector
                  ref="emailServerSelector"
                  :oldEmailServer="tempTask.email_server"></emailServerSelector>
              </el-form-item>
              <el-form-item label="发件人邮箱" class="is-required">
                <el-input
                  v-model="tempTask.email_from"
                  size="mini"
                  placeholder="默认支持QQ邮箱，可到全局参数添加对应的服务器，配置类型选邮箱">
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱密码" prop="desc" class="is-required">
                <el-input
                  v-model="tempTask.email_pwd"
                  size="mini"
                  type="text">
                </el-input>
              </el-form-item>
              <el-form-item label="收件人邮箱" class="is-required">
                <el-input
                  type="textarea"
                  autosize
                  size="mini"
                  v-model="tempTask.email_to"
                  placeholder="收件人邮箱，多个时用英文的 分号 “ ; ” 分隔"
                ></el-input>
              </el-form-item>
            </div>
          </el-form-item>

          <el-form-item label="时间配置" size="mini" class="is-required">
            <el-input v-model="tempTask.cron" style="width: 80%"
                      placeholder="秒 分 时 日 月 周 年 (0 0 12 * * ? * 每天中午12点触发), 如：0 15 10 ? * MON-FRI">
            </el-input>
            <el-link type="primary" href="https://www.bejson.com/othertools/cron/" target="_blank"
                     style="width: 20%">
              调试cron表达式
            </el-link>
          </el-form-item>

          <el-form-item label="运行机制" class="is-required">
            <el-radio
              v-model="tempTask.is_async"
              :label="parseInt(key)" v-for="(value, key) in runModeData" :key="key">
              {{ value }}</el-radio>
            <el-popconfirm
              placement="top"
              :title="'1、串行执行: 用例一条一条顺序串行执行  \n' +
              '2、并行执行: 每条用例一个线程并行执行  \n' +
              '注：并行执行仅仅是为了提升执行效率，请勿用于压力测试'"
              hide-icon>
              <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
            </el-popconfirm>
          </el-form-item>

        </el-tab-pane>


        <el-tab-pane label="配置任务用例" name="case">
          <!-- 使用示例 -->
          <el-collapse accordion>
            <el-collapse-item>
              <template slot="title">
                <div style="color:#409eff"> 点击查看说明</div>
              </template>
              <div style="margin-left: 20px">
                1、若没有选择用例集和用例，则默认运行当前服务下的所有用例集下的所有用例<br>
                2、若要选择用例集下的所有用例，则勾选对应的用例集即可，无需再选择用例<br>
                3、若要选择用例，则点击对应的用例集获取用例列表，再在用例列表中勾选要选择的用例
              </div>
            </el-collapse-item>
          </el-collapse>

          <el-row>
            <el-col style="width: 25%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
              <el-tabs v-model="caseSetTab">
                <el-tab-pane label="用例集列表" name="caseSetTab">
                  <el-tree
                    ref="setTree"
                    class="setTree"
                    :data="tempCaseSetList"
                    show-checkbox
                    node-key="id"
                    check-strictly
                    highlight-current
                    :default-expanded-keys="tempTask.set_id"
                    :default-checked-keys="tempTask.set_id"
                    :props="defaultProps"
                    @node-click="clickTree"
                  >
                  </el-tree>
                </el-tab-pane>
              </el-tabs>
            </el-col>

            <el-col :span="18">
              <el-tabs v-model="caseTab" style="margin-left: 5px">
                <el-tab-pane label="用例列表" name="caseTab">
                  <el-table
                    ref="multipleTable"
                    :data="currentCaseList"
                    tooltip-effect="dark"
                    style="width: 100%"
                    @select="selectRow"
                    @select-all="selectAll">
                    <el-table-column
                      type="selection"
                      :selectable='isDisable'
                      min-width="10%">
                    </el-table-column>

                    <el-table-column
                      prop="name"
                      label="用例名"
                      min-width="70%"
                      show-overflow-tooltip>
                    </el-table-column>

                    <el-table-column prop="is_run" label="是否执行" min-width="20%">
                      <template slot-scope="scope">
                        <el-switch
                          :disabled="true"
                          v-model="scope.row.is_run"
                        ></el-switch>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>

    </el-form>

    <selectRunEnv
      :callBackEvent="callBackEvent"
      :event="runEvent"
    ></selectRunEnv>

    <div class="demo-drawer__footer">
      <el-button
        slot="reference"
        size="mini"
        type="primary"
        style="float: left"
        :loading="isShowDebugLoading"
        @click="clickRunDebug()">调试
      </el-button>

      <el-button @click="drawerIsShow = false" size="mini">取 消</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click.native="tempTask.id ? updateTask() : createTask()"
      >保存
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import environmentSelectorView from "@/components/Selector/environment";
import emailServerSelector from "@/components/Selector/email";
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件

import {postTask, putTask, runTask} from '@/apis/apiTest/task'
import {caseSetList} from "@/apis/apiTest/caseSet";
import {caseList, caseRun, postCase, putCase} from '@/apis/apiTest/case'
import {arrayToTree} from "@/utils/parseData";
import {reportIsDone} from "@/apis/apiTest/report";
import {runTestTimeOutMessage} from "@/utils/message";
import {getRunModel} from "@/apis/config/config";

export default {
  name: "drawer",
  components: {
    environmentSelectorView,
    emailServerSelector,
    selectRunEnv
  },
  data() {
    return {

      activeName: 'taskInfo',
      caseTab: 'caseTab',
      caseSetTab: 'caseSetTab',

      defaultProps: {
        children: 'children',
        label: 'name'
      },
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,
      isShowDebugLoading: false,
      tempTask: {},

      projectLists: '',  // 服务列表
      projectSelectedId: '',  // 服务选择框选择的服务id

      tempCaseSetList: [],  // 当前选中服务下的用例集列表
      currentCaseList: [],  // 当前选中模块下的用例列表

      currentTreeDataId: '',
      runModeData: {},
      runEvent: 'runTaskEventOnDialog',
      callBackEvent: 'runTaskOnDialog'
    }
  },
  methods: {

    // 用例列表的选中框是否禁用
    isDisable(row) {
      return row.is_run
    },

    // 获取执行模式配置
    initRunMode() {
      getRunModel().then(response => {
        this.runModeData = response.data
      })
    },

    // 执行列表默认勾选，遍历用例列表，如果用例的id在task.case_id里面，则把这行标为选中状态
    defaultClick() {
      this.$nextTick(() => {
        this.currentCaseList.forEach(caseRow => {
          if (this.tempTask.case_id.indexOf(caseRow.id) >= 0) {
            this.$refs.multipleTable.toggleRowSelection(caseRow, true)
          }
        })
      })
    },

    // 点击用例集树，获取用例列表
    clickTree(data, node, element) {
      if (this.currentTreeDataId !== data.id) {
        this.getCaseList(data.id)
        this.currentTreeDataId = data.id
      }
    },

    // 列表勾选事件，如果勾选的数据在列表里面，就去掉此数据，如果不在，就添加
    selectRow(selection, row) {
      let index = this.tempTask.case_id.indexOf(row.id)
      index >= 0 ? this.tempTask.case_id.splice(index, 1) : this.tempTask.case_id.push(row.id)
    },

    // 全选或者全部取消
    selectAll(selection) {
      if (selection.length > 0) {  // 全选
        selection.forEach(row => {
          if (this.tempTask.case_id.indexOf(row.id) < 0) {
            this.tempTask.case_id.push(row.id)
          }
        })
      } else {
        this.currentCaseList.forEach(row => {  // 全部取消
          let index = this.tempTask.case_id.indexOf(row.id)
          if (index >= 0) {
            this.tempTask.case_id.splice(index, 1)
          }
        })
      }
    },

    // 获取服务id对应的用例集列表
    getCaseSetByProjectId(project_id) {
      caseSetList({'projectId': project_id}).then(response => {
        var response_data = JSON.stringify(response.data) === '{}' ? [] : response.data.data
        this.tempCaseSetList = arrayToTree(response_data, null)

        // 默认获取第一个用例集的用例
        if (this.tempCaseSetList.length > 0) {
          this.getCaseList(this.tempCaseSetList[0].id)
        }
      })
    },

    // 获取当前模块下的用例列表
    getCaseList(setId) {
      caseList({setId: setId}).then(response => {
        this.currentCaseList = response.data.data
        this.defaultClick()  // 获取完用例列表过后 ，执行默认选中事件
      })
    },

    // 初始化定时任务
    initNewTask() {
      this.tempTask = {
        id: '',
        num: '',
        name: '',
        env: '',
        task_type: 'cron',
        cron: '',
        is_send: '1',
        is_async: 1,
        send_type: 'ding_ding',
        we_chat: '',
        ding_ding: '',
        email_server: '',
        email_to: '',
        email_from: '',
        email_pwd: '',
        set_id: [],
        case_id: [],
        project_id: ''
      }
    },

    // 获取当前数据，用于提交
    getTaskToCommit() {
      return {
        id: this.tempTask.id,
        num: this.tempTask.num,
        name: this.tempTask.name,
        env: this.$refs.environmentSelectorView.current_environment,
        task_type: this.tempTask.task_type,
        cron: this.tempTask.cron,
        is_send: this.tempTask.is_send,
        is_async: this.tempTask.is_async,
        send_type: this.tempTask.send_type,
        we_chat: this.tempTask.we_chat,
        ding_ding: this.tempTask.ding_ding,
        email_server: this.$refs.emailServerSelector.tempEmailServer,
        email_to: this.tempTask.email_to,
        email_from: this.tempTask.email_from,
        email_pwd: this.tempTask.email_pwd,
        project_id: this.tempTask.project_id,
        set_id: this.$refs.setTree.getCheckedKeys(),
        case_id: this.tempTask.case_id,
      }
    },

    // 定时任务编辑框提交成功事件
    busEmit() {
      this.drawerIsShow = false
      this.$bus.$emit(this.$busEvents.api.apiTaskDrawerIsCommit, 'success')
    },

    // 创建定时任务
    createTask() {
      this.submitButtonIsLoading = true
      postTask(this.getTaskToCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.tempTask.id = response.data.id
          this.busEmit()
        }
      })
    },

    // 修改定时任务
    updateTask() {
      this.submitButtonIsLoading = true
      putTask(this.getTaskToCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    },

    // 点击调试按钮
    clickRunDebug(){
      this.$bus.$emit(this.runEvent, true)
    },

    debugTask(runData) {
      this.submitButtonIsLoading = true
      if (this.tempTask.id) {
        putTask(this.getTaskToCommit()).then(response => {
          this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.run(this.tempTask.id, runData)
          }
        })
      } else {
        postTask(this.getTaskToCommit()).then(response => {
          this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.tempTask.id = response.data.id
            this.run(this.tempTask.id, runData)
          }
        })
      }
    },


    // 运行任务
    run(taskId, runData) {
      this.isShowDebugLoading = true
      runTask({id: taskId, env: runData.runEnv, is_async: runData.runType}).then(runResponse => {
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
                  that.isShowDebugLoading = false
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.isShowDebugLoading = false
              that.$notify(runTestTimeOutMessage(that));
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`api.dialogForm.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    }

  },

  mounted() {

    this.initRunMode()

    // 服务树选中项事件
    this.$bus.$on(this.$busEvents.api.apiProjectTreeChoiceProject, (project, project_list) => {
      this.projectLists = project_list  // 当前服务所在的服务列表
      // 如果服务变了，则清空用例集数和用例列表
      if (project.id !== this.projectSelectedId) {
        this.currentCaseList = []
        this.currentCaseList = []
      }
      this.projectSelectedId = project.id  // 当前选中的服务
    })

    // 监听服务树菜单点击事件
    this.$bus.$on(this.$busEvents.api.apiTaskDrawerIsShow, (status, taskOrProject) => {
      if (status === 'update') {  // 修改
        this.tempTask = taskOrProject
      } else {  // 新增
        this.initNewTask()
        this.tempTask.project_id = taskOrProject.id
      }
      this.drawerIsShow = true

      // 获取当前服务对应的用例集列表
      this.getCaseSetByProjectId(this.projectSelectedId)
    })

    this.$bus.$on(this.callBackEvent, (runDict) => {
      this.debugTask(runDict)
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.callBackEvent)
    this.$bus.$off(this.$busEvents.api.apiProjectTreeChoiceProject)
    this.$bus.$off(this.$busEvents.api.apiTaskDrawerIsShow)
  }
}
</script>

<style scoped>
.setTree {
  /*width: 80%;*/
  /*height: 60%;*/
  /*overflow: scroll;*/
}


.collapse_title {
  /*text-align: right;*/
  vertical-align: middle;
  /*float: left;*/
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  /*line-height: 40px;*/
  /*padding: 0 12px 0 0;*/
  /*-webkit-box-sizing: border-box;*/
  box-sizing: border-box;
}
</style>
