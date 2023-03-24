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
              <el-form-item label="报告名" size="mini">
                <el-input
                  v-model="query.projectName"
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

              <el-form-item label="单元" size="mini" label-width="50px">
                <el-select
                  v-model="query.run_type"
                  placeholder="运行单元"
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
                <p>确定删除所选中的测试报告?</p>
                <p style="color: red">关联了失败记录的测试报告不会被删除</p>
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
              :data="reportDataList"
              stripe
              @selection-change="clickSelectAll"
            >
              <el-table-column type="selection" min-width="2%" />

              <el-table-column prop="id" label="序号" align="center" min-width="5%">
                <template slot-scope="scope">
                  <span> {{ (query.pageNum - 1) * query.pageSize + scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="任务名称" min-width="18%" />

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

              <el-table-column v-if="dataType !== 'appUi'" label="运行环境" align="center" min-width="10%">
                <template slot-scope="scope">
                  <span> {{ eventDict[scope.row.env] }} </span>
                </template>
              </el-table-column>

              <el-table-column label="运行单元" align="center" min-width="8%">
                <template slot-scope="scope">
                  <span> {{ runTypeDict[scope.row.run_type] }} </span>
                </template>
              </el-table-column>

              <el-table-column label="是否通过" align="center" min-width="10%">
                <template slot-scope="scope">
                  <el-tag size="small" :type="reportStatusTagType[scope.row.is_passed]">
                    {{ reportStatusContent[scope.row.is_passed] }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="是否生成" align="center" min-width="8%">
                <template slot-scope="scope">
                  <el-tag
                    size="small"
                    :type="scope.row.process === 3 && scope.row.status === 2 ? 'success' : 'warning'"
                  >
                    {{ scope.row.process === 3 && scope.row.status === 2 ? '已生成' : '未生成' }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" align="center" min-width="10%">
                <template slot-scope="scope">

                  <!--查看报告-->
                  <el-button
                    v-show="scope.row.process === 3 && scope.row.status === 2"
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
                    <p>确定删除【{{ scope.row.name }}】?</p>
                    <p style="color: red">关联了失败记录的测试报告不会被删除</p>
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
              v-show="query.total>0"
              :total="query.total"
              :page.sync="query.pageNum"
              :limit.sync="query.pageSize"
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

import { getConfigByName } from '@/apis/config/config'
import { userList } from '@/apis/system/user'
import { runEnvList } from '@/apis/config/runEnv'

import {
  reportStatusMappingContent,
  reportStatusMappingTagType,
  reportTriggerTypeMappingContent
} from '@/utils/mapping'

export default {
  name: 'Index',
  components: { Pagination, projectTreeView },
  props: ['dataType'],
  data() {
    return {
      reportTab: 'reportTab',
      projectId: '',
      reportDataList: [],
      reportTotal: 0,
      query: {
        pageNum: 0,
        pageSize: 20,
        total: 0,
        projectName: undefined,
        createUser: undefined,
        run_type: undefined
      },
      userList: [],
      eventDict: {},
      runTypeDict: {},
      reportStatusContent: reportStatusMappingContent,
      reportStatusTagType: reportStatusMappingTagType,
      reportTriggerType: reportTriggerTypeMappingContent,
      selectedList: [],
      showBatchDelete: false,

      reportListUrl: '',
      deleteReportUrl: '',
      downloadReportUrl: ''
    }
  },

  mounted() {
    this.getUserList()

    this.$bus.$on(this.$busEvents.treeIsChoice, (_type, project) => {
      if (_type === 'project') {
        this.projectId = project.id
        this.query.pageNum = 1
        this.query.pageSize = 20
        this.query.total = 0
        this.getReportList()
      }
    })

    // 获取环境列表
    runEnvList().then(response => {
      response.data.data.forEach(env => {
        this.eventDict[env.code] = env.name
      })
    })

    getConfigByName({ 'name': 'run_type' }).then(response => {
      this.runTypeDict = JSON.parse(response.data.value)
    })
  },

  created() {
    if (this.dataType === 'api') {
      this.reportListUrl = apiReportList
      this.deleteReportUrl = apiDeleteReport
      this.downloadReportUrl = apiDownloadReport
    } else if (this.dataType === 'webUi') {
      this.reportListUrl = webUiReportList
      this.deleteReportUrl = webUiDeleteReport
      this.downloadReportUrl = webUiDownloadReport
    } else {
      this.reportListUrl = appUiReportList
      this.deleteReportUrl = appUiDeleteReport
      this.downloadReportUrl = appUiDownloadReport
    }
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.treeIsChoice)
  },
  methods: {

    // 全选
    clickSelectAll(val) {
      this.selectedList = val
    },

    // 获取用户信息，同步请求
    async getUserList() {
      const response = await userList()
      this.userList = response.data.data
    },

    // 获取服务对应的报告列表
    getReportList() {
      this.query.projectId = this.projectId
      this.reportListUrl(this.query).then(response => {
        this.reportDataList = response.data.data
        this.query.total = response.data.total
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`api.dialogForm.openReportById.reportId: ${JSON.stringify(reportId)}`)
      const { href } = this.$router.resolve({ path: 'reportShow', query: { id: reportId }})
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
      const self = window // this script is only for browsers anyway...
      const defaultMime = 'application/octet-stream' // this default mime also triggers iframe downloads
      const mimeType = strMimeType || defaultMime
      const payload = data
      const anchor = document.createElement('a')
      const toString = function(a) {
        return String(a)
      }
      let myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString)
      const fileName = strFileName || 'download'
      let blob
      let reader
      myBlob = myBlob.call ? myBlob.bind(self) : Blob

      // go ahead and download dataURLs right away
      blob = payload instanceof myBlob
        ? payload
        : new myBlob([payload], { type: mimeType })

      function saver(url, winMode) {
        if ('download' in anchor) { // html5 A[download]
          anchor.href = url
          anchor.setAttribute('download', fileName)
          anchor.className = 'download-js-link'
          anchor.innerHTML = 'downloading...'
          anchor.style.display = 'none'
          document.body.appendChild(anchor)
          setTimeout(function() {
            anchor.click()
            document.body.removeChild(anchor)
            if (winMode === true) {
              setTimeout(function() {
                self.URL.revokeObjectURL(anchor.href)
              }, 250)
            }
          }, 66)
          return true
        }
      }// end saver

      if (self.URL) { // simple fast and modern way using Blob and URL:
        saver(self.URL.createObjectURL(blob), true)
      } else {
        // handle non-Blob()+non-URL browsers:
        if (typeof blob === 'string' || blob.constructor === toString) {
          try {
            return saver('data:' + mimeType + ';base64,' + self.btoa(blob))
          } catch (y) {
            return saver('data:' + mimeType + ',' + encodeURIComponent(blob))
          }
        }

        // Blob but not URL support:
        reader = new FileReader()
        reader.onload = function() {
          saver(this.result)
        }
        reader.readAsDataURL(blob)
      }
      return true
    },

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
      this.deleteReportUrl({ id: selectedIdList }).then(response => {
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
