<template>

  <div class="app-container">

    <el-form label-width="150px" inline>
      <el-form-item :label="'报告名：'" size="mini">
        <el-input
          v-model="projectName"
          class="input-with-select"
          placeholder="报告名，模糊查询"
          size="mini"
          style="width: 400px"
          clearable
        >
        </el-input>
      </el-form-item>

      <el-form-item :label="'创建人：'" size="mini">
        <el-select
          v-model="createUser"
          placeholder="创建人"
          size="mini"
          style="width: 400px"
          filterable
          clearable
          default-first-option
        >
          <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>

      </el-form-item>

      <el-button
        type="primary"
        size="mini"
        @click="getReportList">
        {{ '查询' }}
      </el-button>

    </el-form>

    <el-row>
      <!-- 服务树 -->
      <el-col style="width: 15%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <!-- 服务列表树组件 -->
        <projectTreeView
          ref="projectTree"
          :dataType="dataType"
          :menuName="''"
        ></projectTreeView>
      </el-col>

      <!-- 测试报告 -->
      <el-col style="width: 85%">
        <!-- 测试报告列表 -->
        <el-tabs v-model="reportTab" class="table_padding" style="margin-left: 5px">
          <el-tab-pane label="测试报告列表" :name="reportTab">
            <el-table
              ref="reportTable"
              :data="reportDataList"
              stripe
            >
              <el-table-column prop="id" label="序号" align="center" min-width="10%">
                <template slot-scope="scope">
                  <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip=true prop="name" align="center" label="任务名称" min-width="25%">
              </el-table-column>

              <el-table-column label="生成时间" align="center" min-width="15%">
                <template slot-scope="scope">
                  <span> {{ scope.row.created_time }} </span>
                </template>
              </el-table-column>

              <el-table-column label="触发方式" align="center" min-width="8%">
                <template slot-scope="scope">
                  <span> {{ reportTriggerType[scope.row.trigger_type] }} </span>
                </template>
              </el-table-column>

              <el-table-column label="运行环境" align="center" min-width="8%">
                <template slot-scope="scope">
                  <span> {{ eventDict[scope.row.env] }} </span>
                </template>
              </el-table-column>

              <el-table-column label="运行单元" align="center" min-width="8%">
                <template slot-scope="scope">
                  <span> {{ runTypeDict[scope.row.run_type] }} </span>
                </template>
              </el-table-column>

              <el-table-column label="是否通过" align="center" min-width="8%">
                <template slot-scope="scope">
                  <el-tag size="small" :type="reportStatusTagType[scope.row.is_passed]">
                    {{ reportStatusContent[scope.row.is_passed] }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="是否生成" align="center" min-width="8%">
                <template slot-scope="scope">
                  <el-tag size="small"
                          :type="scope.row.process === 3 && scope.row.status === 2 ? 'success' : 'warning'">
                    {{ scope.row.process === 3 && scope.row.status === 2 ? '已生成' : '未生成' }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" align="center" min-width="10%">
                <template slot-scope="scope">

                  <!--查看报告-->
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-view"
                    style="margin-right: 10px"
                    v-show="scope.row.process === 3 && scope.row.status === 2"
                    @click.native="openReportById(scope.row.id)"></el-button>

                  <!-- 删除报告 -->
                  <el-popover
                    :ref="scope.row.id"
                    v-show="scope.row.process === 3 && scope.row.status === 2"
                    placement="top"
                    popper-class="down-popover"
                    v-model="scope.row.deletePopoverIsShow">
                    <p>确定删除【{{ scope.row.name }}】?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="delReport(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      style="color: red"
                    ></el-button>
                  </el-popover>

                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="reportTotal>0"
              :total="reportTotal"
              :page.sync="pageNum"
              :limit.sync="pageSize"
              @pagination="getReportList"
            />
          </el-tab-pane>

        </el-tabs>
      </el-col>
    </el-row>

  </div>
</template>

<script>

import projectTreeView from '@/components/Trees/projectTree.vue'
import Pagination from '@/components/Pagination/index.vue'

import {
  reportList as apiReportList,
  deleteReport as apiDeleteReport,
  downloadReport as apiDownloadReport
} from '@/apis/apiTest/report'
import {
  reportList as webUiReportList,
  deleteReport as webUiDeleteReport,
  downloadReport as webUiDownloadReport
} from '@/apis/webUiTest/report'
import {
  reportList as appUiReportList,
  deleteReport as appUiDeleteReport,
  downloadReport as appUiDownloadReport
} from '@/apis/appUiTest/report'

import {getConfigByName} from "@/apis/config/config";
import {userList} from "@/apis/system/user";
import {runEnvList} from "@/apis/config/runEnv";

import {reportStatusMappingContent, reportStatusMappingTagType, reportTriggerTypeMappingContent} from "@/utils/mapping";


export default {
  name: 'index',
  props: ["dataType"],
  components: {Pagination, projectTreeView},
  data() {
    return {
      reportTab: 'reportTab',
      projectId: '',
      reportDataList: [],
      reportTotal: 0,
      pageNum: 0,
      pageSize: 20,
      projectName: '',
      createUser: '',
      userList: [],
      eventDict: {},
      runTypeDict: {},
      reportStatusContent: reportStatusMappingContent,
      reportStatusTagType: reportStatusMappingTagType,
      reportTriggerType: reportTriggerTypeMappingContent,

      reportListUrl: '',
      deleteReportUrl: '',
      downloadReportUrl: ''
    }
  },
  methods: {

    // 获取用户信息，同步请求
    async getUserList() {
      let response = await userList()
      this.userList = response.data.data
    },

    // 获取服务对应的报告列表
    getReportList() {
      this.reportListUrl({
        projectId: this.projectId,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        projectName: this.projectName,
        createUser: this.createUser
      }).then(response => {
        this.reportDataList = response.data.data
        this.reportTotal = response.data.total
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`api.dialogForm.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // // 下载测试报告按钮
    // this.downloadReportUrl(reportId) {
    //   downloadReport({'id': reportId}).then((response) => {
    //       this.renderHtml(response.data, "测试报告.html", "text/html")
    //     }
    //   )
    // },

    // 把数据转为html
    renderHtml(data, strFileName, strMimeType) {

      let self = window, // this script is only for browsers anyway...
        defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
        mimeType = strMimeType || defaultMime,
        payload = data,
        anchor = document.createElement("a"),
        toString = function (a) {
          return String(a);
        },
        myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
        fileName = strFileName || "download",
        blob,
        reader;
      myBlob = myBlob.call ? myBlob.bind(self) : Blob;

      //go ahead and download dataURLs right away
      blob = payload instanceof myBlob ?
        payload :
        new myBlob([payload], {type: mimeType});


      function saver(url, winMode) {
        if ('download' in anchor) { //html5 A[download]
          anchor.href = url;
          anchor.setAttribute("download", fileName);
          anchor.className = "download-js-link";
          anchor.innerHTML = "downloading...";
          anchor.style.display = "none";
          document.body.appendChild(anchor);
          setTimeout(function () {
            anchor.click();
            document.body.removeChild(anchor);
            if (winMode === true) {
              setTimeout(function () {
                self.URL.revokeObjectURL(anchor.href);
              }, 250);
            }
          }, 66);
          return true;
        }

      }//end saver

      if (self.URL) { // simple fast and modern way using Blob and URL:
        saver(self.URL.createObjectURL(blob), true);
      } else {
        // handle non-Blob()+non-URL browsers:
        if (typeof blob === "string" || blob.constructor === toString) {
          try {
            return saver("data:" + mimeType + ";base64," + self.btoa(blob));
          } catch (y) {
            return saver("data:" + mimeType + "," + encodeURIComponent(blob));
          }
        }

        // Blob but not URL support:
        reader = new FileReader();
        reader.onload = function () {
          saver(this.result);
        };
        reader.readAsDataURL(blob);
      }
      return true;
    },

    cancelDeletePopover(report) {
      this.$set(report, 'deletePopoverIsShow', false)
    },

    // 删除报告
    delReport(report) {
      this.$set(report, 'deletePopoverIsShow', false)
      this.deleteReportUrl({id: report.id}).then(response => {
        if (this.showMessage(this, response)) {
          this.getReportList()
        }
      })
    },
  },

  mounted() {
    this.getUserList()

    this.$bus.$on(this.$busEvents.treeIsChoice, (_type, project) => {
      if (_type === 'project'){
        this.projectId = project.id
        this.getReportList()
      }
    })

    // 获取环境列表
    runEnvList().then(response => {
      response.data.data.forEach(env => {
        this.eventDict[env.code] = env.name
      })
    })

    getConfigByName({'name': 'run_type'}).then(response => {
      this.runTypeDict = JSON.parse(response.data.value)
    })
  },

  created() {
    if (this.dataType === "api"){
      this.reportListUrl = apiReportList
      this.deleteReportUrl = apiDeleteReport
      this.downloadReportUrl = apiDownloadReport
    }else if (this.dataType === "webUi"){
      this.reportListUrl = webUiReportList
      this.deleteReportUrl = webUiDeleteReport
      this.downloadReportUrl = webUiDownloadReport
    }else {
      this.reportListUrl = appUiReportList
      this.deleteReportUrl = appUiDeleteReport
      this.downloadReportUrl = appUiDownloadReport
    }
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.treeIsChoice)
  }
}
</script>

<style scoped>
.projectTree {
  float: left;
  width: 200px;
}
</style>