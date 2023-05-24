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
          <el-switch
            v-model="scope.row.id !== undefined"
            @change="changStatus(scope.row)"
          />
        </template>
      </el-table-column>

    </el-table>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

import { jobList, jobFuncList, jobRun, getJob, postJob, deleteJob } from '@/apis/system/job'

export default {
  name: 'Index',
  components: {
    Pagination
  },
  directives: { waves },
  data() {
    return {

      jobFuncListData: [],

      drawerIsShow: false, // 编辑框的显示状态
      drawerType: '', // dialog框状态，edit为编辑数据, create为新增数据
      direction: 'rtl', // 抽屉打开方式
      listLoading: true // 请求加载状态
    }
  },
  computed: {},

  watch: {},

  mounted() {
    this.getJobFuncList()

    // 获取业务线列表
  },

  methods: {

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
