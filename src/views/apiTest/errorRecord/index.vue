<template>
  <div class="app-container">

    <!-- 表格栏 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="record_list"
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="created_time" align="center" min-width="15%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'错误类型'" prop="name" align="center" min-width="20%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'错误概览'" prop="detail" align="center" min-width="50%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span>{{ scope.row.detail }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'查看详情'" prop="detail" align="center" min-width="10%" :show-overflow-tooltip=true>
        <template slot-scope="{row, $index}">

          <el-button
            size="mini"
            icon="el-icon-view"
            type="text"
            @click="showDetail(row)">
          </el-button>

        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getErrorRecordList"/>

    <el-drawer
      :title="currentRow.name"
      size="60%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content" style="margin-left: 20px">
        <pre class="el-collapse-item-content" style="overflow: auto">{{ currentRow.detail }}</pre>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

import {errorRecordList} from '@/apis/testWork/errorRecord'

export default {
  name: 'Project',
  components: {
    Pagination
  },
  directives: {waves},
  data() {
    return {
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20
      },

      record_list: [],

      // 数据表格起始
      tableKey: 0,

      // 数据表格总条数
      total: 0,

      // 请求加载状态
      listLoading: true,

      drawerIsShow: false,

      currentRow: {},

      direction: 'rtl',  // 抽屉打开方式
    }
  },

  created() {
    // 初始化服务列表
    this.getErrorRecordList()

  },

  methods: {

    // 获取服务列表
    getErrorRecordList() {
      this.listLoading = true
      errorRecordList(this.listQuery).then(response => {
        this.record_list = response.data.data
        this.total = response.data.total
      })
      this.listLoading = false
    },

    // 查看详情
    showDetail(row){
      this.currentRow = row
      this.drawerIsShow = true
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getErrorRecordList()
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20
      }
      this.getErrorRecordList()
    },
  },
}
</script>
