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

      <el-table-column :label="'请求方法'" prop="url" align="center" min-width="10%" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span> {{ scope.row.method }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'接口地址'" prop="url" align="center" min-width="20%" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span> {{ scope.row.url }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'错误概览'" prop="detail" align="center" min-width="40%" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.detail }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'查看详情'" prop="detail" align="center" min-width="10%" :show-overflow-tooltip="true">
        <template slot-scope="{row, $index}">

          <el-button
            size="mini"
            icon="el-icon-view"
            type="text"
            @click="showDetail(row)"
          />

        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getErrorRecordList"
    />

    <el-drawer
      :title="'错误详情'"
      size="60%"
      :wrapper-closable="false"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <div class="demo-drawer__content" style="margin-left: 20px">
        <div>
          <label class="label-style">请求方法：</label>
          <el-input :value="currentRow.method" style="width: 85%" size="mini" disabled />
        </div>

        <div style="margin-top: 10px">
          <label class="label-style">接口地址：</label>
          <el-input :value="currentRow.url" style="width: 85%" size="mini" disabled />
        </div>

        <div style="margin-top: 10px">
          <label class="label-style">头部信息：</label>
          <el-input
            :value="currentRow.headers ? JSON.stringify(currentRow.headers) : {}"
            disabled
            style="width: 85%"
            size="mini"
            type="textarea"
            :rows="2"
          />
        </div>

        <div style="margin-top: 10px">
          <label class="label-style">url参数：</label>
          <el-input
            :value="currentRow.params ? JSON.stringify(currentRow.params) : {}"
            disabled
            style="width: 85%"
            size="mini"
            type="textarea"
            :rows="2"
          />
        </div>

        <div style="margin-top: 10px">
          <label class="label-style">form参数：</label>
          <el-input
            :value="currentRow.data_form ? JSON.stringify(currentRow.data_form) : {}"
            disabled
            style="width: 85%"
            size="mini"
            type="textarea"
            :rows="2"
          />
        </div>

        <div style="margin-top: 10px">
          <label class="label-style">json参数：</label>
          <el-input
            :value="currentRow.data_json ? JSON.stringify(currentRow.data_json) : {}"
            disabled
            style="width: 85%"
            size="mini"
            type="textarea"
            :rows="2"
          />
        </div>

        <div style="margin-top: 30px">
          <label class="label-style">错误详情：</label>
          <pre class="el-collapse-item-content" style="overflow: auto">{{ currentRow.detail }}</pre>
        </div>

      </div>
    </el-drawer>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

import { errorRecordList } from '@/apis/system/errorRecord'
import { userList } from '@/apis/system/user'

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
      tableKey: 0, // 数据表格起始
      total: 0, // 数据表格总条数
      listLoading: true, // 请求加载状态
      drawerIsShow: false,
      currentRow: {},
      direction: 'rtl', // 抽屉打开方式
      userList: [],
      userDict: {}
    }
  },

  created() {
    this.getUserList(this.getErrorRecordList)
  },

  methods: {

    // 获取用户信息，同步请求
    async getUserList(func) {
      const response = await userList()
      this.userList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user.name
      })
      if (func) {
        func()
      }
    },

    // 获取服务列表
    getErrorRecordList() {
      this.listLoading = true
      errorRecordList(this.listQuery).then(response => {
        this.record_list = response.data
        this.total = response.total
      })
      this.listLoading = false
    },

    parseUser(user_id) {
      return this.userDict[user_id]
    },

    // 查看详情
    showDetail(row) {
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
    }
  }
}
</script>

<style>

.label-style{
  display:inline-block;
  width:90px;
}

</style>
