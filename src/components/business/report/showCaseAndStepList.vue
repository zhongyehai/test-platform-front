<template>
  <div style="margin-left: 5px; margin-right: 5px">
    <el-row>
      <el-col style="width: 44%; border:3px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <el-tabs v-model="caseListTab">
          <el-tab-pane :label="caseListTab" :name="caseListTab">
            <el-table
              v-loading="caseTableIsLoading"
              element-loading-text="数据获取中"
              element-loading-spinner="el-icon-loading"
              :data="showCaseList"
              row-key="id"
              :row-class-name="tableRowClassName"
              :height="tableHeight"
              size="mini"
              :expand-row-keys="expandIds"
              stripe
              @expand-change="changeExpandStatus"
              @row-click="clickRow"
            >

              <!-- 步骤列表 -->
              <el-table-column type="expand" min-width="2%">
                <template slot-scope="scope">
                  <el-table
                    :ref="scope.row.id"
                    v-loading="stepTableIsLoading"
                    :show-header="false"
                    element-loading-text="数据获取中"
                    element-loading-spinner="el-icon-loading"
                    :data="showStepList"
                    row-key="id"
                    :header-cell-style="{'text-align':'center'}"
                    :row-class-name="tableRowClassName"
                    :height="tableHeight * 0.8"
                    size="mini"
                    stripe
                    @row-click="clickRow"
                  >
                    <el-table-column prop="num" label="序号" align="center" min-width="10%">
                      <template slot-scope="scope">
                        <span> {{ scope.$index + 1 }} </span>
                      </template>
                    </el-table-column>

                    <el-table-column show-overflow-tooltip prop="name" label="名称" align="left" min-width="45%">
                      <template slot-scope="scope">
                        <span
                          :style="{'textDecoration': scope.row.result === 'skip' ? 'line-through' : ''}"
                        >
                          {{ scope.row.name }}
                        </span>
                      </template>
                    </el-table-column>

                    <el-table-column show-overflow-tooltip prop="duration" label="耗时" align="center" min-width="20%">
                      <template slot-scope="scope">
                        <span v-if="scope.row.row_id.indexOf('case') !== -1"> {{ scope.row.result !== 'error' ? scope.row.summary.time.duration || '-' : '-' }}秒 </span>
                        <span v-else> {{ scope.row.summary.elapsed_ms ? `${scope.row.summary.elapsed_ms}毫秒` : '-' }} </span>
                      </template>
                    </el-table-column>

                    <el-table-column prop="operate" align="center" label="操作" min-width="12%">
                      <template slot-scope="scope">
                        <el-button
                          v-show="scope.row.result !== 'waite'"
                          type="text"
                          size="mini"
                          @click="showCaseInfo(scope.row)"
                        >
                          <!-- {{ `${scope.row.row_id.indexOf('case') !== -1 ? '用例' : '步骤'}` }}-->
                          编辑
                        </el-button>
                      </template>
                    </el-table-column>

                  </el-table>
                </template>
              </el-table-column>

              <el-table-column prop="num" label="序号" align="center" min-width="10%">
                <template slot-scope="scope">
                  <span> {{ scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip prop="name" label="名称" align="left" min-width="45%">
                <template slot-scope="scope">
                  <span
                    :style="{'textDecoration': scope.row.result === 'skip' ? 'line-through' : ''}"
                  >
                    {{ scope.row.name }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip prop="duration" label="耗时" align="center" min-width="20%">
                <template slot-scope="scope">
                  <span v-if="scope.row.row_id.indexOf('case') !== -1"> {{ scope.row.result !== 'error' ? scope.row.summary.time.duration || '-' : '-' }}秒 </span>
                  <span v-else> {{ scope.row.summary.elapsed_ms ? `${scope.row.summary.elapsed_ms}毫秒` : '-' }} </span>
                </template>
              </el-table-column>

              <el-table-column prop="operate" align="center" label="操作" min-width="12%">
                <template slot-scope="scope">
                  <el-button
                    v-show="scope.row.result !== 'waite'"
                    type="text"
                    size="mini"
                    @click="showCaseInfo(scope.row)"
                  >
                    <!-- {{ `${scope.row.row_id.indexOf('case') !== -1 ? '用例' : '步骤'}` }}-->
                    编辑
                  </el-button>
                </template>
              </el-table-column>

            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col style="width: 55%; margin-left: 5px">
        <el-tabs v-show="reportStepDetailIsShow" v-model="stepDataTab">
          <el-tab-pane :label="stepDataTab" :name="stepDataTab">
            <el-scrollbar class="aside_scroll" :style="{height: `${tableHeight}px`}">
              <showStepView
                :data-type="dataType"
                :step-data="stepData"
              />
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>

        <el-tabs v-show="reportCaseDetailIsShow" v-model="caseDataTab">
          <el-tab-pane :label="caseDataTab" :name="caseDataTab">
            <el-scrollbar class="aside_scroll" :style="{height: `${tableHeight}px`}">
              <showCaseView
                :data-type="dataType"
                :case-data="caseData"
                :before-img-is-loading="before_img_is_loading"
                :after-img-is-loading="after_img_is_loading"
              />
            </el-scrollbar>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import {
  reportCaseList as apiReportCaseList,
  reportCaseDetail as apiReportCaseDetail,
  reportStepList as apiReportStepList,
  reportStepDetail as apiReportStepDetail
} from '@/apis/apiTest/report'

import {
  reportCaseList as webUiReportCaseList,
  reportCaseDetail as webUiReportCaseDetail,
  reportStepList as webUiReportStepList,
  reportStepDetail as webUiReportStepDetail,
  reportStepImg as webUiReportStepImg

} from '@/apis/webUiTest/report'

import {
  reportCaseList as appUiReportCaseList,
  reportCaseDetail as appUiReportCaseDetail,
  reportStepList as appUiReportStepList,
  reportStepDetail as appUiReportStepDetail,
  reportStepImg as appUiReportStepImg
} from '@/apis/appUiTest/report'
import showStepView from '@/components/business/report/showStepDetail.vue'
import showCaseView from '@/components/business/report/showCaseDetail.vue'

export default {
  name: 'ShowCaseAndStepList',
  components: { showStepView, showCaseView },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'showCaseType', 'showStepType'
  ],
  data() {
    return {
      caseTableIsLoading: false,
      stepTableIsLoading: false,
      tableHeight: window.innerHeight * 0.85,
      report_id: '',
      caseListTab: '用例列表',
      caseDataTab: '用例明细',
      stepDataTab: '步骤明细',

      // 展示步骤的数据
      direction: 'rtl',
      reportStepDetailIsShow: false,
      reportCaseDetailIsShow: false,
      stepData: {
        'case_id': undefined,
        'name': undefined,
        'stat': {
          'response_time_ms': undefined,
          'elapsed_ms': undefined,
          'content_size': undefined,
          'request_at': undefined,
          'response_at': undefined
        },
        'redirect_print': undefined,
        'variables_mapping': {},
        'request': {
          'url': undefined,
          'method': undefined,
          'headers': {},
          'body': {},
          'timeout': 60,
          'params': {},
          'json': {},
          'data': {},
          'files': {},
          'verify': false,
          'allow_redirects': false
        },
        'response': {
          'ok': true,
          'url': undefined,
          'status_code': 200,
          'reason': 'OK',
          'cookies': {},
          'encoding': 'utf-8',
          'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Length': '84',
            'Server': 'Werkzeug/2.0.1 Python/3.9.6',
            'Date': 'Tue, 20 Jun 2023 05:56:20 GMT'
          },
          'content_type': 'text/html; charset=utf-8',
          'json': {}
        },
        'test_action': {
          'execute_name': '',
          'action': '',
          'by_type': '',
          'screen': '',
          'element': '',
          'text': '',
          'wait_time_out': ''
        },
        'extract_msgs': {},
        'validation_results': [],
        'before': null,
        'after': null
      },
      caseData: {
        case_data: '{}'
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

      expandIds: [], // 要展开的行数据的id

      showCaseList: [],
      allCaseList: [],
      successCaseList: [],
      failCaseList: [],
      skipCaseList: [],
      errorCaseList: [],

      showStepList: [],
      allStepList: [],
      successStepList: [],
      failStepList: [],
      skipStepList: [],
      errorStepList: [],
      before_img_is_loading: false,
      after_img_is_loading: false,

      reportCaseListUrl: '',
      reportCaseDetailUrl: '',
      reportStepListUrl: '',
      reportStepDetailUrl: '',
      reportStepImgUrl: ''
    }
  },

  watch: {
    'showCaseType': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal === 'all') {
          this.showCaseList = this.allCaseList
        } else if (newVal === 'success') {
          this.showCaseList = this.successCaseList
        } else if (newVal === 'fail') {
          this.showCaseList = this.failCaseList
        } else if (newVal === 'skip') {
          this.showCaseList = this.skipCaseList
        } else if (newVal === 'error') {
          this.showCaseList = this.errorCaseList
        }
      }
    },

    'showStepType': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal === 'all') {
          this.showStepList = this.allStepList
        } else if (newVal === 'success') {
          this.showStepList = this.successStepList
        } else if (newVal === 'fail') {
          this.showStepList = this.failStepList
        } else if (newVal === 'error') {
          this.showStepList = this.errorStepList
        } else if (newVal === 'skip') {
          this.showStepList = this.skipStepList
        }
      }
    }

  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, report_id) => {
      if (_type === 'showReportCaseList') {
        this.report_id = report_id
        this.tableHeight = window.innerHeight * 0.85
        this.getStepCaseList(report_id)
      }
    })
  },

  created() {
    if (this.dataType === 'api') {
      this.reportCaseListUrl = apiReportCaseList
      this.reportCaseDetailUrl = apiReportCaseDetail
      this.reportStepListUrl = apiReportStepList
      this.reportStepDetailUrl = apiReportStepDetail
    } else if (this.dataType === 'webUi') {
      this.reportCaseListUrl = webUiReportCaseList
      this.reportCaseDetailUrl = webUiReportCaseDetail
      this.reportStepListUrl = webUiReportStepList
      this.reportStepDetailUrl = webUiReportStepDetail
      this.reportStepImgUrl = webUiReportStepImg
    } else {
      this.reportCaseListUrl = appUiReportCaseList
      this.reportCaseDetailUrl = appUiReportCaseDetail
      this.reportStepListUrl = appUiReportStepList
      this.reportStepDetailUrl = appUiReportStepDetail
      this.reportStepImgUrl = appUiReportStepImg
    }
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {
    tableRowClassName({ row, rowIndex }) {
      return `${row.result}-row`
    },

    // 报告步骤的详细数据
    // showStepData(stepDataId) {
    //   this.reportStepDetailUrl({ id: stepDataId }).then(response => {
    //     this.stepData = response.data.step_data
    //     this.reportStepDetailIsShow = true
    //   })
    // },

    // 点击打开或者收起引用用例
    changeExpandStatus(row, status) {
      this.reportCaseDetailIsShow = false
      const expandIdIndex = this.expandIds.indexOf(row.id)
      if (expandIdIndex === -1) { // 打开用例
        this.expandIds.push(row.id)
        this.getStepList(row.id)
      } else {
        this.expandIds.splice(expandIdIndex, 1)
      }
    },

    // 点击用例/步骤
    clickRow(row, column, event) {
      if (row.row_id.indexOf('step') !== -1 && column.property === 'name') { // 点步骤
        this.getStepData(row.id)
        this.reportCaseDetailIsShow = false
      } else if (row.row_id.indexOf('case') !== -1 && column.property === 'name') { // 点用例
        this.caseData = JSON.parse(JSON.stringify(row))
        this.reportStepDetailIsShow = false
        this.reportCaseDetailIsShow = true
      }
    },

    // 点击用例
    getStepList(report_case_id) {
      this.showStepList = []
      this.allStepList = []
      this.successStepList = []
      this.failStepList = []
      this.skipStepList = []
      this.errorStepList = []

      this.stepTableIsLoading = true
      this.reportStepListUrl({ report_case_id: report_case_id, get_summary: true }).then(response => {
        this.stepTableIsLoading = false
        // 自动获取第一个步骤的数据
        if (response.data.length > 0) {
          this.getStepData(response.data[0].id)
        }
        this.parseStepList(response.data) // 分状态存储步骤数据
      })
    },

    getStepData(id) {
      const loading = this.$loading({
        lock: true,
        text: `${this.dataType === 'api' ? '测试报告' : 'ui自动化测试报告包含截图，'}数据较大，所以数据传输会稍久，请耐心等待`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.reportStepDetailUrl({ id: id }).then(response => {
        loading.close()
        this.stepData = response.data.step_data
        this.reportStepDetailIsShow = true

        // 非接口测试，获取对应的截图
        if (this.dataType !== 'api') {
          // 获前置取截图
          this.before_img_is_loading = true
          this.reportStepImgUrl({ report_id: this.report_id, report_step_id: id, img_type: 'before_page' }).then(response => {
            this.stepData.before = response.data.data
            this.before_img_is_loading = false
          })

          // 获后置取截图
          this.after_img_is_loading = true
          this.reportStepImgUrl({ report_id: this.report_id, report_step_id: id, img_type: 'after_page' }).then(response => {
            this.stepData.after = response.data.data
            this.after_img_is_loading = false
          })
        }
      })
    },

    // 解析和分状态储存用例列表
    parseCaseList(caseList) {
      // 展示用例信息
      if (caseList.length > 0) {
        this.caseData = caseList[0]
        this.reportCaseDetailIsShow = true
      }
      caseList.forEach(caseData => {
        caseData['row_id'] = `case_${caseData.id}`
        caseData.case_data = this.parseVariables(caseData)

        // 判断用例下有没有步骤
        if (caseData.result !== 'error') {
          caseData.children = []
          const summary = JSON.parse(caseData.summary)
          caseData.hasStep = summary.stat.total > 0 // 直接跳过的用例、用例下所有步骤都跳过的，total为0
          caseData.summary = summary
        }

        // 分开储存用例
        if (caseData.result === 'success') {
          this.successCaseList.push(caseData)
        } else if (caseData.result === 'fail') {
          this.failCaseList.push(caseData)
        } else if (caseData.result === 'skip') {
          this.skipCaseList.push(caseData)
        } else {
          this.errorCaseList.push(caseData)
        }
        this.allCaseList.push(caseData)
      })
      this.showCaseList = this.allCaseList
    },

    // 解析和分状态储存步骤列表
    parseStepList(stepList) {
      stepList.forEach(step => {
        step['row_id'] = `step_${step.id}`
        step.summary = JSON.parse(step.summary)

        // 分开储存步骤
        if (step.result === 'success') {
          this.successStepList.push(step)
        } else if (step.result === 'fail') {
          this.failStepList.push(step)
        } else if (step.result === 'skip') {
          this.skipStepList.push(step)
        } else {
          this.errorStepList.push(step)
        }
        this.allStepList.push(step)
      })

      this.showStepList = this.allStepList
    },

    // 获取用例列表
    getStepCaseList(report_id) {
      this.caseTableIsLoading = true
      this.reportCaseListUrl({ get_summary: true, report_id: report_id }).then(response => {
        this.caseTableIsLoading = false
        this.parseCaseList(response.data)
      })
    },

    // 打开数据所在的用例，有可能传入的是用例，也有可能传入的是步骤
    showCaseInfo(row) {
      const case_id = row.row_id.indexOf('case') !== -1 ? row.from_id : row.case_id
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'reportShowCaseInfo',
        case_id
      )
    },

    parseVariables(caseData) {
      const case_data = JSON.parse(caseData.case_data)

      const variables = []
      for (var variable_key in case_data.variables) {
        variables.push({ key: variable_key, value: case_data.variables[variable_key] })
      }
      case_data.variables = variables

      const headers = []
      for (var header_key in case_data.headers) {
        headers.push({ key: header_key, value: case_data.variables[header_key] })
      }
      case_data.headers = headers

      return case_data
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
