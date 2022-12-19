<template>

  <div style="margin: 20px">
    <el-steps :active="activeProcess"
              align-center
              finish-status="success"
              :process-status="statusMapping[activeStatus]">
      <el-step title="触发执行" description="触发执行"></el-step>
      <el-step title="解析数据" description="解析测试数据"></el-step>
      <el-step title="执行测试" description="执行测试用例，时间会稍久，取决于用例设计"></el-step>
      <el-step title="写入报告" description="用例执行完毕，写入测试报告"></el-step>
    </el-steps>


  </div>

</template>
<script>
import {getReport as apiTestGetReport} from "@/apis/apiTest/report";
import {getReport as appUiTestGetReport} from "@/apis/appUiTest/report";
import {getReport as webUiTestGetReport} from "@/apis/webUiTest/report";
import {runTestTimeOutMessage} from "@/utils/message";


export default {
  name: 'runStep',

  props: ['runType'],

  data() {
    return {
      getReportUrl: '',
      statusMapping: {
        1: "wait",
        2: "finish",
        3: "error",
        4: "success"
      },
      activeProcess: 3,
      activeStatus: 4
    };
  },

  methods: {

    getReport(reportId){
      // 触发运行成功，每三秒查询一次，
      // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
      // 已出结果，则停止查询，展示测试报告
      var that = this
      var runTimeoutCount = Number(this.$busEvents.runTimeout) * 1000 / 3000
      var queryCount = 1
      var timer = setInterval(function () {
        if (queryCount <= runTimeoutCount) {
          this.getReportUrl({'id': reportId}).then(response => {
            this.activeProcess = response.data.process
            this.activeStatus = response.data.status

            if (response.data.process === 4 && response.data.status === 1) {
              that.openReportById(reportId)
              clearInterval(timer)  // 关闭定时器
            }
          })
          queryCount += 1
        } else {
          that.$notify(runTestTimeOutMessage(that));
          clearInterval(timer)  // 关闭定时器
        }
      }, 3000)

    },

    openReportById(reportId) {
      // console.log(`task.index.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },
  },

  created(){

    // 根据运行类型初始化接口
    if (this.runType === "api"){
      this.getReportUrl = apiTestGetReport
    }else if (this.runType === "webUi"){
      this.getReportUrl = webUiTestGetReport
    }else {
      this.getReportUrl = appUiTestGetReport
    }
  },

  mounted(){
    // 监听 接口 Dialog 框 的提交状态，提交成功，则重新请求接口列表
    this.$bus.$on(this.$busEvents.data.showRunProcess, (reportId) => {
      this.getReport(reportId)
    })
  },

  beforeDestroy() {
    this.$bus.$off(this.$busEvents.data.showRunProcess)
  },
};
</script>
