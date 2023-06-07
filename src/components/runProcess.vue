<template>

  <el-dialog
    width="70%"
    title="测试执行进度"
    :visible.sync="processIsShow"
    :close-on-click-modal="false"
    append-to-body
  >
    <div style="margin: 20px">
      <el-steps
        :active="activeProcess"
        align-center
        finish-status="success"
        :process-status="statusMapping[activeStatus]"
      >
        <el-step title="触发执行">
          <template slot="description">
            <span>触发执行测试</span><br>
          </template>
        </el-step>
        <el-step title="解析数据">
          <template slot="description">
            <span>若一直卡在此节点</span><br>
            <span>1、可能是数据较多，解析确实需要花一些时间</span><br>
            <span>2、可能是解析的时候报错了，此情况请查看日志</span>
          </template>
        </el-step>
        <el-step title="执行测试">
          <template slot="description">
            <span>执行耗时多久取决于用例设计，请耐心等待</span>
          </template>
        </el-step>
        <el-step title="写入报告">
          <template slot="description">
            <span>1、用例执行完毕，写入测试报告</span><br>
            <span>2、写入完毕后会自动打开测试报告</span>
          </template>
        </el-step>
      </el-steps>
    </div>
  </el-dialog>

</template>
<script>
import { reportIsDone as apiReportIsDone, reportShowId as apiGetReport } from '@/apis/apiTest/report'
import { reportIsDone as appUiReportIsDone, reportShowId as appUiGetReport } from '@/apis/appUiTest/report'
import { reportIsDone as webUiReportIsDone, reportShowId as webUiGetReport } from '@/apis/webUiTest/report'
import { runTestTimeOutMessage } from '@/utils/message'

export default {
  name: 'RunStep',
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
      activeProcess: 0,
      activeStatus: 1,
      reportIsDoneUrl: '',
      reportShowIdUrl: ''
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
      this.reportIsDoneUrl = apiReportIsDone
      this.reportShowIdUrl = apiGetReport
    } else if (this.dataType === 'webUi') {
      this.reportIsDoneUrl = webUiReportIsDone
      this.reportShowIdUrl = webUiGetReport
    } else {
      this.reportIsDoneUrl = appUiReportIsDone
      this.reportShowIdUrl = appUiGetReport
    }
  },

  mounted() {
    // 监听运行申请的提交状态，提交成功，则获取对应的测试报告
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, batch_id) => {
      if (_type === 'process') {
        this.activeProcess = 1
        this.activeStatus = 1
        this.processIsShow = true
        this.getReport(batch_id)
      }
    })
  },

  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    getShowReportId(batch_id) {
      const that = this
      this.reportShowIdUrl({ batch_id: batch_id }).then(response => (
        that.openReportById(response.data)
      ))
    },

    getReport(batch_id) {
      // 触发运行成功，每三秒查询一次，
      // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
      // 已出结果，则停止查询，展示测试报告

      const that = this
      const runTimeoutCount = Number(this.$busEvents.runTimeout) * 1000 / 3000
      let queryCount = 1
      that.timer = setInterval(function() {
        if (queryCount <= runTimeoutCount) {
          that.reportIsDoneUrl({
            batch_id: batch_id,
            process: that.activeProcess,
            status: that.activeStatus
          }).then(response => {
            that.activeProcess = response.data.process
            that.activeStatus = response.data.status
            if (that.activeProcess === 3 && that.activeStatus === 2) {
              that.processIsShow = false // 关闭进度框
              that.getShowReportId(batch_id)
              clearInterval(that.timer) // 关闭定时器
            }
          })
          queryCount += 1
        } else {
          that.$notify(runTestTimeOutMessage(that))
          this.processIsShow = false // 关闭进度框
          clearInterval(that.timer) // 关闭定时器
        }
      }, 3000)
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
