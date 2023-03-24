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
            <span>若一直卡在此节点</span><br>
            <span>1、可能是用例设计的测试步骤耗时较多，确实需要花一些时间</span><br>
            <span>2、可能是执行测试的时候报错了，此情况请查看日志</span>
          </template>
        </el-step>
        <el-step title="写入报告">
          <template slot="description">
            <span>用例执行完毕，写入测试报告</span><br>
            <span>写入完毕后会自动打开测试报告</span>
          </template>
        </el-step>
      </el-steps>
    </div>
  </el-dialog>

</template>
<script>
import { getReport as apiTestGetReport } from '@/apis/apiTest/report'
import { getReport as appUiTestGetReport } from '@/apis/appUiTest/report'
import { getReport as webUiTestGetReport } from '@/apis/webUiTest/report'
import { runTestTimeOutMessage } from '@/utils/message'

export default {
  name: 'RunStep',
  props: [
    'dataType'
  ],

  data() {
    return {
      processIsShow: false,
      statusMapping: {
        1: 'wait',
        2: 'success',
        3: 'error',
        4: 'finish'
      },
      activeProcess: 0,
      activeStatus: 1,
      getReportUrl: ''
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.getReportUrl = apiTestGetReport
    } else if (this.dataType === 'webUi') {
      this.getReportUrl = webUiTestGetReport
    } else {
      this.getReportUrl = appUiTestGetReport
    }
  },

  mounted() {
    // 监听运行申请的提交状态，提交成功，则获取对应的测试报告
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, reportId) => {
      if (_type === 'process') {
        this.activeProcess = 0
        this.activeStatus = 1
        this.processIsShow = true
        this.getReport(reportId)
      }
    })
  },

  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    getReport(reportId) {
      // 触发运行成功，每三秒查询一次，
      // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
      // 已出结果，则停止查询，展示测试报告

      var that = this
      var runTimeoutCount = Number(this.$busEvents.runTimeout) * 1000 / 3000
      var queryCount = 1
      var timer = setInterval(function() {
        if (queryCount <= runTimeoutCount) {
          that.getReportUrl({ 'id': reportId }).then(response => {
            that.activeProcess = response.data.process
            that.activeStatus = response.data.status

            if (that.activeProcess === 3 && that.activeStatus === 2) {
              this.processIsShow = false // 关闭进度框
              that.openReportById(reportId)
              clearInterval(timer) // 关闭定时器
            }
          })
          queryCount += 1
        } else {
          that.$notify(runTestTimeOutMessage(that))
          this.processIsShow = false // 关闭进度框
          clearInterval(timer) // 关闭定时器
        }
      }, 3000)
    },

    openReportById(reportId) {
      // console.log(`task.index.openReportById.reportId: ${JSON.stringify(reportId)}`)
      const { href } = this.$router.resolve({ path: 'reportShow', query: { id: reportId }})
      window.open(href, '_blank')
    }
  }
}
</script>
