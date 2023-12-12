<template>

  <div class="app-container">

    <el-row>
      <!-- 服务树 -->
      <el-col style="width: 15%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <!-- 服务列表树组件 -->
        <projectTreeView
          ref="projectTree"
          :data-type="dataType"
          :menu-name="''"
        />
      </el-col>

      <!-- 测试报告 -->
      <el-col style="width: 85%">

        <!-- 测试报告列表 -->
        <el-tabs v-model="reportTab" class="table_padding" style="margin-left: 5px">
          <el-tab-pane label="测试报告列表" :name="reportTab">

            <el-form label-width="60px" inline>

              <el-form-item label="环境" size="mini">
                <el-select
                  v-model="query.env_list"
                  placeholder="运行环境"
                  size="mini"
                  multiple
                  clearable
                  default-first-option
                >
                  <el-option
                    v-for="item in eventList"
                    :key="item.code"
                    :label="item.name"
                    :value="item.code"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="报告名" size="mini">
                <el-input
                  v-model="query.project_name"
                  class="input-with-select"
                  placeholder="报告名，模糊查询"
                  size="mini"
                  clearable
                />
              </el-form-item>

              <el-form-item label="创建人" size="mini" label-width="60px">
                <el-select
                  v-model="query.createUser"
                  placeholder="创建人"
                  size="mini"
                  filterable
                  clearable
                  default-first-option
                >
                  <el-option
                    v-for="item in userList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="类型" size="mini" label-width="50px">
                <el-select
                  v-model="query.run_type"
                  placeholder="运行类型"
                  size="mini"
                  filterable
                  clearable
                  default-first-option
                >
                  <el-option
                    v-for="(value, key) in runTypeDict"
                    :key="key"
                    :label="value"
                    :value="key"
                  />
                </el-select>
              </el-form-item>

              <el-button
                type="primary"
                size="mini"
                @click="getReportList"
              >查询
              </el-button>

              <el-popover
                v-show="selectedList.length > 0"
                v-model="showBatchDelete"
                placement="top"
                popper-class="down-popover"
              >
                确定删除所选中的测试报告?
                <div style="color: red">
                  1、关联了问题记录的测试报告不会被删除 <br>
                  2、触发方式为【定时任务】或者【流水线】的，只有管理员能删除
                </div>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelBatchDeletePopover()">取消</el-button>
                  <el-button type="primary" size="mini" @click="delReport">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  type="primary"
                  size="mini"
                  style="margin-left: 5px"
                >批量删除
                </el-button>
              </el-popover>

            </el-form>

            <el-table
              ref="reportTable"
              v-loading="tableIsLoading"
              size="mini"
              element-loading-text="正在获取数据..."
              element-loading-spinner="el-icon-loading"
              :data="reportDataList"
              stripe
              @selection-change="clickSelectAll"
              @cell-dblclick="cellDblclick"
            >
              <el-table-column type="selection" min-width="2%" />

              <el-table-column prop="id" label="序号" align="center" min-width="5%">
                <template slot-scope="scope">
                  <span> {{ (query.page_num - 1) * query.page_size + scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip prop="name" align="center" label="报告名称" min-width="18%" />

              <el-table-column show-overflow-tooltip label="生成时间" align="center" min-width="15%">
                <template slot-scope="scope">
                  <span> {{ scope.row.create_time }} </span>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="触发方式" align="center" min-width="8%">
                <template slot-scope="scope">
                  <span> {{ reportTriggerType[scope.row.trigger_type] }} </span>
                </template>
              </el-table-column>

              <el-table-column v-if="dataType !== 'appUi'" show-overflow-tooltip label="运行环境" align="center" min-width="10%">
                <template slot-scope="scope">
                  <span> {{ eventDict[scope.row.env] }} </span>
                </template>
              </el-table-column>

              <!--              <el-table-column show-overflow-tooltip label="运行单元" align="center" min-width="8%">-->
              <!--                <template slot-scope="scope">-->
              <!--                  <span> {{ runTypeDict[scope.row.run_type] }} </span>-->
              <!--                </template>-->
              <!--              </el-table-column>-->

              <el-table-column show-overflow-tooltip label="是否通过" align="center" min-width="10%">
                <template slot-scope="scope">
                  <el-tag size="small" :type="reportStatusTagType[scope.row.is_passed]">
                    {{ reportStatusContent[scope.row.is_passed] }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="是否完成" align="center" min-width="8%">
                <template slot-scope="scope">
                  <el-tag
                    size="small"
                    :type="scope.row.process === 3 && scope.row.status === 2 ? 'success' : 'warning'"
                  >
                    {{ scope.row.process === 3 && scope.row.status === 2 ? '已完成' : '执行中' }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip label="创建人" align="center" min-width="8%">
                <template slot-scope="scope">
                  <span> {{ userDict[scope.row.create_user] }} </span>
                </template>
              </el-table-column>

              <el-table-column label="操作" align="center" min-width="12%">
                <template slot-scope="scope">

                  <!--重跑-->
                  <!-- v-show="scope.row.run_type !== 'api' && (scope.row.process === 3 && scope.row.status === 2 || isAdmin)"-->
                  <el-button
                    v-show="scope.row.run_type !== 'api' || isAdmin"
                    type="text"
                    size="mini"
                    @click.native="reRun(scope.row)"
                  >重跑
                  </el-button>

                  <!--查看报告-->
                  <el-button
                    type="text"
                    size="mini"
                    style="margin-right: 10px"
                    @click.native="openReportById(scope.row.id)"
                  >查看
                  </el-button>

                  <!-- 删除报告 -->
                  <el-popover
                    v-show="scope.row.process === 3 && scope.row.status === 2"
                    :ref="scope.row.id"
                    v-model="scope.row.deletePopoverIsShow"
                    placement="top"
                    popper-class="down-popover"
                  >
                    确定删除【{{ scope.row.name }}】?
                    <div style="color: red">
                      1、关联了问题记录的测试报告不会被删除 <br>
                      2、触发方式为【定时任务】或者【流水线】的，只有管理员能删除
                    </div>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="delReport(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      style="color: red"
                    >删除
                    </el-button>
                  </el-popover>

                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="queryTotal>0"
              :total="queryTotal"
              :page.sync="query.page_num"
              :limit.sync="query.page_size"
              :page-sizes="[10, 20, 40, 60, 100, 200]"
              @pagination="getReportList"
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

  </div>
</template>

<script>

import projectTreeView from '@/components/Trees/projectTree.vue'
import Pagination from '@/components/Pagination/index.vue'

import { getProject as apiGetProject } from '@/apis/apiTest/project'
import { getCase as apiGetCase, caseRun as apiCaseRun } from '@/apis/apiTest/case'
import { runApi as apiRun } from '@/apis/apiTest/api'
import { caseSuiteRun as apiRunCaseSuite } from '@/apis/apiTest/suite'
import { runTask as apiRunTask } from '@/apis/apiTest/task'
import {
  reportList as apiReportList,
  deleteReport as apiDeleteReport
} from '@/apis/apiTest/report'

import { getProject as webUiGetProject } from '@/apis/webUiTest/project'
import { getCase as webUiGetCase, caseRun as webUiCaseRun } from '@/apis/webUiTest/case'
import { caseSuiteRun as webUiRunCaseSuite } from '@/apis/webUiTest/suite'
import { runTask as webUiRunTask } from '@/apis/webUiTest/task'
import {
  reportList as webUiReportList,
  deleteReport as webUiDeleteReport
} from '@/apis/webUiTest/report'

import { getProject as appUiGetProject } from '@/apis/appUiTest/project'
import { getCase as appUiGetCase, caseRun as appUiCaseRun } from '@/apis/appUiTest/case'
import { caseSuiteRun as appUiRunCaseSuite } from '@/apis/appUiTest/suite'
import { runTask as appUiRunTask } from '@/apis/appUiTest/task'
import {
  reportList as appUiReportList,
  deleteReport as appUiDeleteReport
} from '@/apis/appUiTest/report'

import { getConfigByCode } from '@/apis/config/config'
import { userList } from '@/apis/system/user'
import { runEnvList } from '@/apis/config/runEnv'

import {
  reportStatusMappingContent,
  reportStatusMappingTagType,
  reportTriggerTypeMappingContent
} from '@/utils/mapping'
import selectRunEnv from '@/components/selectRunEnv.vue'
import runProcess from '@/components/runProcess.vue'

export default {
  name: 'Index',
  components: { runProcess, selectRunEnv, Pagination, projectTreeView },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType'
  ],
  data() {
    return {
      reportTab: 'reportTab',
      projectId: '',
      reportDataList: [],
      reportTotal: 0,
      query: {
        detail: true,
        page_num: 0,
        page_size: 20,
        project_name: undefined,
        createUser: undefined,
        env_list: [],
        run_type: undefined
      },
      tableIsLoading: false,
      isAdmin: localStorage.getItem('permissions').indexOf('admin') !== -1,
      queryTotal: 0,
      userList: [],
      userDict: {},
      eventDict: {},
      eventList: {},
      runTypeDict: {},
      reportStatusContent: reportStatusMappingContent,
      reportStatusTagType: reportStatusMappingTagType,
      reportTriggerType: reportTriggerTypeMappingContent,
      selectedList: [],
      showBatchDelete: false,
      reRunReport: {},

      apiRunUrl: '',
      caseRunUrl: '',
      taskRunUrl: '',
      caseSuiteRunUrl: '',
      getProjectUrl: '',
      getCaseUrl: '',
      reportListUrl: '',
      deleteReportUrl: ''
    }
  },

  mounted() {
    this.getUserList()

    this.$bus.$on(this.$busEvents.treeIsChoice, (_type, project) => {
      if (_type === 'project') {
        this.projectId = project.id

        // 获取对应的运行环境
        runEnvList({ business_id: project.business_id }).then(response => {
          this.eventList = response.data.data
          this.eventList.forEach(env => {
            this.eventDict[env.code] = env.name
          })
        })

        this.query.page_num = 1
        this.query.page_size = 20
        this.queryTotal = 0
        this.getReportList()
      }
    })

    // 用例提交成功，请求用例列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'selectRunEnv' && _runUnit === 'reportIndex') {
        this.runCase(runDict)
      }
    })

    getConfigByCode({ code: 'run_type' }).then(response => {
      this.runTypeDict = response.data
    })
  },

  created() {
    if (this.dataType === 'api') {
      this.apiRunUrl = apiRun
      this.caseRunUrl = apiCaseRun
      this.taskRunUrl = apiRunTask
      this.caseSuiteRunUrl = apiRunCaseSuite
      this.getCaseUrl = apiGetCase
      this.getProjectUrl = apiGetProject
      this.reportListUrl = apiReportList
      this.deleteReportUrl = apiDeleteReport
    } else if (this.dataType === 'webUi') {
      this.taskRunUrl = webUiRunTask
      this.caseSuiteRunUrl = webUiRunCaseSuite
      this.caseRunUrl = webUiCaseRun
      this.getCaseUrl = webUiGetCase
      this.getProjectUrl = webUiGetProject
      this.reportListUrl = webUiReportList
      this.deleteReportUrl = webUiDeleteReport
    } else {
      this.taskRunUrl = appUiRunTask
      this.caseSuiteRunUrl = appUiRunCaseSuite
      this.caseRunUrl = appUiCaseRun
      this.getCaseUrl = appUiGetCase
      this.getProjectUrl = appUiGetProject
      this.reportListUrl = appUiReportList
      this.deleteReportUrl = appUiDeleteReport
    }
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.treeIsChoice)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },
  methods: {

    // 全选
    clickSelectAll(val) {
      this.selectedList = val
    },

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      if (typeof (data) === 'string') {
        this.$copyText(data).then(
          function(e) {
            that.$message.success('复制成功')
          }
        )
      }
    },

    // 获取用户信息，同步请求
    async getUserList() {
      const response = await userList()
      this.userList = response.data.data
      this.userList.forEach(user => {
        this.userDict[user.id] = user.name
      })
    },

    // 获取服务对应的报告列表
    getReportList() {
      this.query.project_id = this.projectId
      this.tableIsLoading = true
      this.reportListUrl(this.query).then(response => {
        this.tableIsLoading = false
        this.reportDataList = response.data.data
        this.queryTotal = response.data.total
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`api.dialogForm.openReportById.reportId: ${JSON.stringify(reportId)}`)
      const { href } = this.$router.resolve({ path: 'reportShow', query: { id: reportId }})
      window.open(href, '_blank')
    },

    // 重跑
    reRun(report) {
      this.reRunReport = report
      // 获取报告对应的服务的业务线id
      let project = null

      // 获取服务
      this.getProjectUrl({ id: report.project_id }).then(response => {
        project = response.data

        const run_type = this.reRunReport.run_type
        if (run_type === 'case') {
          const temp_variables = this.reRunReport.temp_variables
          if (temp_variables) { // 本身就有临时参数
            this.sendReRun(project.business_id, temp_variables)
          } else { // 没有就获取用例的数据
            if (this.reRunReport.trigger_id.length === 1) {
              this.getCaseUrl({ id: this.reRunReport.trigger_id[0] }).then(response => {
                const case_data = response.data
                this.sendReRun(project.business_id, {
                  skip_if: case_data.skip_if,
                  variables: case_data.variables,
                  run_times: case_data.run_times,
                  headers: case_data.headers
                })
              })
            } else {
              this.sendReRun(project.business_id, null)
            }
          }
        } else {
          this.sendReRun(project.business_id, null)
        }
      })
    },

    sendReRun(business_id, temp_run_args) {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'selectRunEnv',
        'reportIndex',
        ['task', 'suite'].indexOf(this.reRunReport.run_type) !== -1,
        business_id,
        temp_run_args
      )
    },

    getRunUrl() {
      const run_type = this.reRunReport.run_type
      return run_type === 'task' ? this.taskRunUrl
        : run_type === 'suite' ? this.caseSuiteRunUrl
          : run_type === 'case' ? this.caseRunUrl
            : this.apiRunUrl
    },

    // 运行用例
    runCase(runConf) {
      const runUrl = this.getRunUrl()

      runUrl({
        api_list: this.reRunReport.run_type === 'api' ? this.reRunReport.trigger_id : undefined,
        case_id_list: this.reRunReport.run_type === 'case' ? this.reRunReport.trigger_id : undefined,
        id: ['task', 'suite'].indexOf(this.reRunReport.run_type) !== -1 ? this.reRunReport.trigger_id : undefined,
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        no_reset: runConf.noReset,
        temp_variables: runConf.temp_variables,
        'trigger_type': 'page'
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id, response.data.report_id)
        }
      })
    },

    // // 下载测试报告按钮
    // this.downloadReportUrl(reportId) {
    //   downloadReport({'id': reportId}).then((response) => {
    //       this.renderHtml(response.data, "测试报告.html", "text/html")
    //     }
    //   )
    // },

    // 把数据转为html
    // renderHtml(data, strFileName, strMimeType) {
    //   const self = window // this script is only for browsers anyway...
    //   const defaultMime = 'application/octet-stream' // this default mime also triggers iframe downloads
    //   const mimeType = strMimeType || defaultMime
    //   const payload = data
    //   const anchor = document.createElement('a')
    //   const toString = function(a) {
    //     return String(a)
    //   }
    //   let myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString)
    //   const fileName = strFileName || 'download'
    //   let blob
    //   let reader
    //   myBlob = myBlob.call ? myBlob.bind(self) : Blob
    //
    //   // go ahead and download dataURLs right away
    //   // eslint-disable-next-line prefer-const
    //   blob = payload instanceof myBlob
    //     ? payload
    //     // eslint-disable-next-line new-cap
    //     : new myBlob([payload], { type: mimeType })
    //
    //   function saver(url, winMode) {
    //     if ('download' in anchor) { // html5 A[download]
    //       anchor.href = url
    //       anchor.setAttribute('download', fileName)
    //       anchor.className = 'download-js-link'
    //       anchor.innerHTML = 'downloading...'
    //       anchor.style.display = 'none'
    //       document.body.appendChild(anchor)
    //       setTimeout(function() {
    //         anchor.click()
    //         document.body.removeChild(anchor)
    //         if (winMode === true) {
    //           setTimeout(function() {
    //             self.URL.revokeObjectURL(anchor.href)
    //           }, 250)
    //         }
    //       }, 66)
    //       return true
    //     }
    //   }// end saver
    //
    //   if (self.URL) { // simple fast and modern way using Blob and URL:
    //     saver(self.URL.createObjectURL(blob), true)
    //   } else {
    //     // handle non-Blob()+non-URL browsers:
    //     if (typeof blob === 'string' || blob.constructor === toString) {
    //       try {
    //         return saver('data:' + mimeType + ';base64,' + self.btoa(blob))
    //       } catch (y) {
    //         return saver('data:' + mimeType + ',' + encodeURIComponent(blob))
    //       }
    //     }
    //
    //     // Blob but not URL support:
    //     reader = new FileReader()
    //     reader.onload = function() {
    //       saver(this.result)
    //     }
    //     reader.readAsDataURL(blob)
    //   }
    //   return true
    // },

    cancelDeletePopover(report) {
      this.$set(report, 'deletePopoverIsShow', false)
    },

    cancelBatchDeletePopover() {
      this.showBatchDelete = false
    },

    // 删除报告
    delReport(row) {
      // 删除单个
      let selectedIdList = []
      if (row.id) {
        this.$set(row, 'deletePopoverIsShow', false)
        selectedIdList = [row.id]
      } else { // 批量删除
        this.showBatchDelete = false
        this.selectedList.forEach(report => {
          selectedIdList.push(report.id)
        })
      }
      this.tableIsLoading = true
      this.deleteReportUrl({ id_list: selectedIdList }).then(response => {
        this.tableIsLoading = false
        if (this.showMessage(this, response)) {
          this.getReportList()
        }
      })
    }
  }
}
</script>

<style scoped>
.projectTree {
  float: left;
  width: 200px;
}
</style>
