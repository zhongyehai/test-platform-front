<template>
  <div>

    <el-dialog
      width="85%"
      title="测试执行进度"
      :visible.sync="processIsShow"
      :close-on-click-modal="false"
      append-to-body
    >
      <div style="margin-left: 20px; margin-right: 20px">
        <el-steps
          :active="activeProcess"
          align-center
          finish-status="success"
          :process-status="statusMapping[activeStatus]"
        >
          <el-step title="触发执行" />
          <el-step title="解析数据" />
          <el-step title="执行测试" />
          <el-step title="写入报告" />
        </el-steps>

        <div>
          <div v-show="activeProcess === 0" style="margin-top: 20px; text-align: center">
            <div>正在触发执行测试...</div>
          </div>

          <div v-show="activeProcess === 1" style="margin-top: 20px; text-align: center">
            <div>正在解析数据...</div>
            <div>若一直卡在此节点</div>
            <div>1、可能是数据较多，解析确实需要花一些时间</div>
            <div>2、可能是解析的时候报错了，此情况请查看日志</div>
          </div>

          <div v-show="activeProcess === 2">
            <div v-show="reportId">
              <el-row>
                <el-col style="width: 35%; border:3px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
                  <el-tabs v-model="caseTab">
                    <el-tab-pane :label="caseTab" :name="caseTab">
                      <el-table
                        :data="reportCaseDataList"
                        :row-class-name="tableRowClassName"
                        :height="tableHeight"
                        size="mini"
                        @row-click="clickCase"
                      >
                        <el-table-column prop="num" label="序号" align="center" min-width="15%">
                          <template slot-scope="scope">
                            <span> {{ scope.$index + 1 }} </span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="result" label="状态" align="center" min-width="20%">
                          <template slot-scope="scope">
                            <el-tag
                              size="small"
                              :type="resultTagMapping[scope.row.result]"
                            >{{ resultMapping[scope.row.result] }}
                            </el-tag>
                          </template>
                        </el-table-column>

                        <el-table-column show-overflow-tooltip prop="name" label="用例名" align="left" min-width="55%">
                          <template slot-scope="scope">
                            <span
                              :style="{'textDecoration': scope.row.result === 'skip' ? 'line-through' : ''}"
                            > {{ scope.row.name }} </span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-tab-pane>
                  </el-tabs>

                </el-col>

                <el-col style="width: 64%; margin-left: 5px">
                  <el-tabs v-model="stepTab">
                    <el-tab-pane :label="stepTab" :name="stepTab">
                      <el-table
                        :data="reportStepDataList"
                        :row-class-name="tableRowClassName"
                        :height="tableHeight"
                        size="mini"
                      >
                        <el-table-column prop="num" label="序号" align="center" min-width="10%">
                          <template slot-scope="scope">
                            <span> {{ scope.$index + 1 }} </span>
                          </template>
                        </el-table-column>

                        <el-table-column prop="result" label="状态" align="center" min-width="10%">
                          <template slot-scope="scope">
                            <el-tag
                              size="small"
                              :type="resultTagMapping[scope.row.result]"
                            >{{ resultMapping[scope.row.result] }}
                            </el-tag>
                          </template>
                        </el-table-column>

                        <el-table-column show-overflow-tooltip prop="name" align="left" label="步骤名" min-width="55%">
                          <template slot-scope="scope">
                            <span
                              :style="{'textDecoration': scope.row.result === 'skip' ? 'line-through' : ''}"
                            > {{ scope.row.name }} </span>
                          </template>
                        </el-table-column>

                        <el-table-column prop="process" align="center" label="节点" min-width="15%">
                          <template slot-scope="scope">
                            <el-tag size="small" type="info">{{ processMapping[scope.row.process] }}</el-tag>
                          </template>
                        </el-table-column>

                        <el-table-column prop="result" align="center" label="操作" min-width="10%">
                          <template slot-scope="scope">
                            <el-button
                              v-show="scope.row.result !== 'waite'"
                              type="text"
                              size="mini"
                              @click="showStepData(scope.row.id)"
                            >查看
                            </el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-tab-pane>
                  </el-tabs>
                </el-col>
              </el-row>

            </div>

            <div v-show="!reportId" style="margin-top: 50px; text-align: center">
              执行耗时多久取决于用例设计，请耐心等待
            </div>

          </div>

          <div v-show="activeProcess === 3" style="margin-top: 50px; text-align: center">
            <div>正在分析和保存测试报告...</div>
            <div>1、用例执行完毕，正在保存测试报告</div>
            <div>2、保存完毕后会自动打开测试报告页面</div>
          </div>
        </div>

      </div>
    </el-dialog>

    <el-drawer
      title="步骤数据"
      :visible.sync="reportStepDetailIsShow"
      :direction="direction"
      :append-to-body="true"
      size="60%"
    >
      <div style="margin-left: 20px; margin-right: 20px">
        <showStepView
          :data-type="dataType"
          :step-data="reportStepData"
        />
      </div>

    </el-drawer>

  </div>
</template>
<script>
import {
  reportStatus as apiReportStatus,
  reportShowId as apiGetReport,
  reportCaseList as apiReportCaseList,
  reportCaseDetail as apiReportCaseDetail,
  reportStepList as apiReportStepList,
  reportStepDetail as apiReportStepDetail
} from '@/apis/apiTest/report'

import {
  reportStatus as appUiReportStatus,
  reportShowId as appUiGetReport,
  reportCaseList as appUiReportCaseList,
  reportCaseDetail as appUiReportCaseDetail,
  reportStepList as appUiReportStepList,
  reportStepDetail as appUiReportStepDetail
} from '@/apis/appUiTest/report'

import {
  reportStatus as webUiReportStatus,
  reportShowId as webUiGetReport,
  reportCaseList as webUiReportCaseList,
  reportCaseDetail as webUiReportCaseDetail,
  reportStepList as webUiReportStepList,
  reportStepDetail as webUiReportStepDetail
} from '@/apis/webUiTest/report'
import { runTestTimeOutMessage } from '@/utils/message'
import showStepView from '@/components/business/report/showStepDetail.vue'
import { count } from 'echarts/lib/component/dataZoom/history'

export default {
  name: 'RunStep',
  components: { showStepView },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType'
  ],

  data() {
    return {
      processIsShow: false,
      timer: undefined,
      statusMapping: {
        1: 'finish',
        2: 'success',
        3: 'error',
        4: 'finish'
      },
      tableHeight: '',
      activeProcess: 2, // 0,
      activeStatus: 1,
      reportId: 1,
      reportCaseId: undefined,
      processMapping: {
        'waite': '等待解析',
        'parse': '解析数据',
        'before': '前置条件',
        'after': '后置条件',
        'run': '测试',
        'extract': '数据提取',
        'validate': '断言'
      },
      resultMapping: {
        'waite': '等待',
        'running': '执行中',
        'fail': '不通过',
        'success': '通过',
        'skip': '跳过',
        'error': '报错'
      },
      resultTagMapping: {
        'waite': 'info',
        'running': '',
        'fail': 'danger',
        'success': 'success',
        'skip': 'info',
        'error': 'warning'
      },
      reportCaseDataList: [], // [{ 'id': 1, 'name': '用例1', 'result': 'success' }],
      caseTab: '用例列表',
      stepTab: '步骤列表',
      reportCaseData: {},
      reportStepDataList: [], // [{ 'id': 1, 'name': '步骤1', 'process': 'before', 'result': 'success' }]
      reportStepData: {},
      direction: 'rtl',
      reportStepDetailIsShow: false,
      defaultShowDetailInfo: ['01', '03', '04', '05', '08'], // 默认展开报告详情的项
      defaultShowRequestInFo: ['request_05'], // 接口自动化，请求信息
      defaultShowResponseInFo: ['response_02'], // 接口自动化，响应信息
      defaultShowExecuteInFo: ['execute_01', 'execute_02'], // UI自动化，执行信息

      reportStatusUrl: '',
      reportShowIdUrl: '',
      reportCaseListUrl: '',
      reportCaseDetailUrl: '',
      reportStepListUrl: '',
      reportStepDetailUrl: ''
    }
  },

  watch: {
    // 如果手动关闭弹窗，就关闭定时器
    'processIsShow': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal === false) {
          try {
            clearInterval(this.timer) // 关闭定时器
          } catch (e) {
            console.log('查询定时器已关闭')
          }
        }
      }
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.reportStatusUrl = apiReportStatus
      this.reportShowIdUrl = apiGetReport
      this.reportCaseListUrl = apiReportCaseList
      this.reportCaseDetailUrl = apiReportCaseDetail
      this.reportStepListUrl = apiReportStepList
      this.reportStepDetailUrl = apiReportStepDetail
    } else if (this.dataType === 'webUi') {
      this.reportStatusUrl = webUiReportStatus
      this.reportShowIdUrl = webUiGetReport
      this.reportCaseListUrl = webUiReportCaseList
      this.reportCaseDetailUrl = webUiReportCaseDetail
      this.reportStepListUrl = webUiReportStepList
      this.reportStepDetailUrl = webUiReportStepDetail
    } else {
      this.reportStatusUrl = appUiReportStatus
      this.reportShowIdUrl = appUiGetReport
      this.reportCaseListUrl = appUiReportCaseList
      this.reportCaseDetailUrl = appUiReportCaseDetail
      this.reportStepListUrl = appUiReportStepList
      this.reportStepDetailUrl = appUiReportStepDetail
    }
  },

  mounted() {
    // 监听运行申请的提交状态，提交成功，则获取对应的测试报告
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, batch_id, report_id) => {
      if (_type === 'process') {
        this.activeProcess = 1
        this.activeStatus = 1
        this.reportId = report_id
        this.reportCaseId = undefined
        this.tableHeight = window.innerHeight * 0.85
        this.processIsShow = true
        this.getReport(batch_id)
      }
    })
  },

  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    // 报告步骤的详细数据
    showStepData(stepDataId) {
      this.reportStepDetailUrl({ id: stepDataId }).then(response => {
        this.reportStepData = response.data.step_data
        this.reportStepDetailIsShow = true
      })
    },

    tableRowClassName({ row, rowIndex }) {
      return `${row.result}-row`
    },

    getShowReportId(batch_id) {
      const that = this
      this.reportShowIdUrl({ batch_id: batch_id }).then(response => (
        that.openReportById(response.data)
      ))
    },

    // 点击用例，查对应用例的步骤执行信息
    clickCase(row, column, event) {
      this.reportCaseId = row.id
    },

    getRunningReportCaseId(reportCaseList) {
      reportCaseList.forEach(reportCase => {
        if (reportCase.result === 'running') {
          this.reportCaseId = reportCase.id
        }
      })
    },

    getReport(batch_id) {
      // 触发运行成功，每1.5秒查询一次，
      // 最后都没查出结果，则停止查询，提示用户去测试报告页查看
      // 已出结果，则停止查询，展示测试报告

      const that = this
      const runTimeoutCount = Number(this.$busEvents.runTimeout) * 1000 / 1500
      let queryCount = 1
      that.timer = setInterval(function() {
        if (queryCount <= runTimeoutCount) {
          that.reportStatusUrl({
            batch_id: batch_id,
            process: that.activeProcess,
            status: that.activeStatus
          }).then(response => {
            if (response.status === 200) {
              that.activeProcess = response.data.process
              that.activeStatus = response.data.status

              if (that.reportId && that.activeProcess === 2) { // 执行中
                // 获取执行的用例
                that.reportCaseListUrl({ report_id: that.reportId }).then(response => {
                  that.reportCaseDataList = response.data
                  // that.getRunningReportCaseId(that.reportCaseDataList)  // 自动查最新的在执行的用例
                  if (!that.reportCaseId) {
                    that.reportCaseId = response.data[0].id
                  }
                  // 获取指定用例的执行步骤
                  that.reportStepListUrl({ report_case_id: that.reportCaseId }).then(response => {
                    that.reportStepDataList = response.data
                  })
                })
              } else if (that.activeProcess === 3 && that.activeStatus === 2) {
                that.processIsShow = false // 关闭进度框
                that.getShowReportId(batch_id)
                clearInterval(that.timer) // 关闭定时器
              }
            } else {
              this.processIsShow = false // 关闭进度框
              clearInterval(that.timer) // 关闭定时器
            }
          })
          queryCount += 1
        } else {
          that.$notify(runTestTimeOutMessage(that))
          this.processIsShow = false // 关闭进度框
          clearInterval(that.timer) // 关闭定时器
        }
      }, 1500)
    },

    openReportById(reportId) {
      // console.log(`task.index.openReportById.reportId: ${JSON.stringify(reportId)}`)
      // 如果是造数据的页面触发的，则跳转到接口测试报告页面，否则根据测试类型跳报告
      const { href } = this.$router.resolve({
        path: window.location.href.indexOf('Test') !== -1 ? 'reportShow' : '/apiTest/reportShow',
        query: { id: reportId }
      })
      window.open(href, '_blank')
    }
  }
}
</script>

<style>
.el-table .error-row {
  color: rgb(232, 124, 37);
}

.el-table .success-row {
  color: rgb(25, 212, 174);
}

.el-table .fail-row {
  color: rgb(250, 110, 134);
}

.el-table .skip-row {
  color: #909399;
}
</style>
