<template>
  <div class="app-container">

    <!-- 表格栏 -->
    <el-table
      key="id"
      v-loading="listLoading"
      :data="jobFuncListData"
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="10%" size="mini">
        <template slot-scope="scope">
          <span> {{ scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'任务名'" prop="name" align="center" min-width="20%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'任务方法名'" prop="name" align="center" min-width="20%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.func_name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'下次执行时间'" prop="name" align="center" min-width="20%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.next_run_time || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="status" label="启用状态" min-width="15%">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.id !== undefined" @change="changStatus(scope.row)" />
        </template>
      </el-table-column>

      <el-table-column align="center" prop="status" label="操作" min-width="15%">
        <template slot-scope="scope">

          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.runPopoverIsShow"
            placement="top"
            popper-class="down-popover"
            style="margin-right: 10px"
          >
            <p>确定执行一次?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelRunPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="runJob(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="text" size="mini">触发执行</el-button>
          </el-popover>

          <el-button type="text" size="mini" @click="showRunJobLog(scope.row)">查看记录</el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-drawer
      title="执行记录"
      size="70%"
      :visible.sync="runLogIsShow"
      :direction="direction"
    >
      <el-table
        :data="runLogList"
        fit
        stripe
        highlight-current-row
        style="width: 100%;"
        @cell-dblclick="cellDblclick"
      >
        <el-table-column :label="'序号'" align="center" min-width="10%" size="mini">
          <template slot-scope="scope">
            <span> {{ scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column :label="'执行时间'" property="created_time" align="center" min-width="15%" size="mini">
          <template slot-scope="scope">
            <span>{{ scope.row.created_time }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="'任务方法名'" property="func_name" align="center" min-width="20%" size="mini">
          <template slot-scope="scope">
            <span>{{ scope.row.func_name }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="'业务线'" property="business_id" align="center" min-width="10%" size="mini">
          <template slot-scope="scope">
            <span>{{ businessDict[scope.row.business_id] }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="'状态'" property="status" align="center" min-width="10%" size="mini">
          <template slot-scope="scope">
            <el-tag :type="statusTagMapping[scope.row.status]" size="mini">
              {{ statusContentMapping[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="'概览'" property="detail" show-overflow-tooltip align="center" min-width="25%" size="mini">
          <template slot-scope="scope">
            <span>{{ scope.row.detail }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="'操作'" property="detail" show-overflow-tooltip align="center" min-width="10%" size="mini">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="showRunJobLogDetail(scope.row.detail)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="runLogTotal>0"
        :total="runLogTotal"
        :page.sync="page_num"
        :limit.sync="page_size"
        @pagination="showRunJobLog"
      />
    </el-drawer>

    <el-drawer
      title="记录明细"
      size="50%"
      :visible.sync="isShowDetail"
      :direction="direction"
    >
      <div style="margin-left:20px; margin-right: 20px">
        <el-row>
          <el-col :span="20">
            <JsonViewer
              :value="JSON.parse(showDetail)"
              :expand-depth="5"
              copyable
            />
          </el-col>
          <el-col :span="4">
            <el-button
              v-clipboard:copy="getCopyData()"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              size="mini"
              type="primary"
            >复制
            </el-button>
          </el-col>
        </el-row>
      </div>

    </el-drawer>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive

import { jobRunLog, jobFuncList, jobRun, postJob, deleteJob } from '@/apis/system/job'
import Pagination from '@/components/Pagination/index.vue'
import { businessList } from '@/apis/config/business'
import JsonViewer from 'vue-json-viewer'

export default {
  name: 'Index',
  components: { JsonViewer, Pagination },
  directives: { waves },
  data() {
    return {

      jobFuncListData: [],

      drawerIsShow: false, // 编辑框的显示状态
      drawerType: '', // dialog框状态，edit为编辑数据, create为新增数据
      direction: 'rtl', // 抽屉打开方式
      listLoading: true, // 请求加载状态
      businessDict: {},
      runLogIsShow: false,
      statusContentMapping: {
        0: '执行中',
        1: '执行失败',
        2: '执行成功'
      },
      statusTagMapping: {
        0: 'info',
        1: 'danger',
        2: 'success'
      },
      currentFuncName: '',
      runLogList: [],
      runLogTotal: 0,
      page_num: 1,
      page_size: 10,

      showDetail: '{}',
      isShowDetail: false
    }
  },
  computed: {},

  watch: {},

  mounted() {
    this.getJobFuncList()
    this.getBusinessList()

    // 获取业务线列表
  },

  methods: {

    showRunJobLogDetail(detail) {
      this.showDetail = detail
      this.isShowDetail = true
    },

    // 获取复制的内容，如果是字符串，则直接返回，否则转为字符串后返回
    getCopyData() {
      return JSON.stringify(JSON.parse(this.showDetail), null, 4)
    },

    // 复制成功
    onCopy(e) {
      this.$message.success('内容已复制到剪贴板')
    },

    // 复制失败
    onError(e) {
      this.$message.error('内容复制失败')
    },

    // 获取业务线列表
    getBusinessList() {
      businessList().then(response => {
        response.data.data.forEach(business => {
          this.businessDict[business.id] = business.name
        })
      })
    },

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      console.log('row: ', row)
      console.log('column: ', column)
      console.log('column.property: ', column.property)
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

    // 展示任务执行记录
    showRunJobLog(row) {
      if (row && row.func_name) {
        this.currentFuncName = row.func_name
      }
      jobRunLog({ func_name: this.currentFuncName, pageNum: this.page_num, pageSize: this.page_size }).then(response => {
        if (this.showMessage(this, response)) {
          this.runLogTotal = response.data.total
          this.runLogList = response.data.data
          this.runLogIsShow = true
        }
      })
    },

    cancelRunPopover(row) {
      this.$set(row, 'runPopoverIsShow', false)
    },

    // 手动执行认识
    runJob(row) {
      this.$set(row, 'runPopoverIsShow', false)
      jobRun({ id: row.func_name }).then(response => {
        this.showMessage(this, response)
      })
    },

    getJobFuncList() {
      this.listLoading = true
      jobFuncList().then(response => {
        this.listLoading = false
        this.jobFuncListData = response.data
      })
    },

    changStatus(row) {
      this.listLoading = true

      if (row.id) { // 关闭任务
        deleteJob({ id: row.func_name }).then(response => {
          this.listLoading = false
          if (this.showMessage(this, response)) {
            this.getJobFuncList()
          }
        })
      } else { // 添加任务
        postJob({ func: row.func_name }).then(response => {
          this.listLoading = false
          if (this.showMessage(this, response)) {
            this.getJobFuncList()
          }
        })
      }
    }
  }

}
</script>
