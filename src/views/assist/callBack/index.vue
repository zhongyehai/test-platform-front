<template>
  <div class="app-container">

    <!-- 表格栏 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      size="mini"
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

      <el-table-column :label="'回调地址'" prop="name" align="center" min-width="20%" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span> {{ scope.row.url }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" prop="detail" align="center" min-width="10%" :show-overflow-tooltip="true">
        <template slot-scope="{row, $index}">
          <el-button
            size="mini"
            type="text"
            @click="showDetail(row)"
          >查看详情</el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getCallBackList"
    />

    <el-drawer
      :title="'回调详情'"
      size="70%"
      :wrapper-closable="false"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <div class="demo-drawer__content" style="margin-left: 20px">
        <div style="margin-bottom: 30px">
          <label>回调参数:</label>
          <pre class="el-collapse-item-content" style="overflow: auto">{{ currentRow.data_json }}</pre>
        </div>

        <div>
          <label>响应数据:</label>
          <pre class="el-collapse-item-content" style="overflow: auto">{{ currentRow.result }}</pre>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

import { callBackList } from '@/apis/assist/callBack'

export default {
  name: 'Project',
  components: {
    Pagination
  },
  directives: { waves },
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

      direction: 'rtl' // 抽屉打开方式
    }
  },

  created() {
    // 初始化服务列表
    this.getCallBackList()
  },

  methods: {

    // 获取服务列表
    getCallBackList() {
      this.listLoading = true
      callBackList(this.listQuery).then(response => {
        this.record_list = response.data.data
        this.total = response.data.total
      })
      this.listLoading = false
    },

    // 查看详情
    showDetail(row) {
      this.currentRow = row
      this.drawerIsShow = true
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getCallBackList()
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20
      }
      this.getCallBackList()
    }
  }
}
</script>
