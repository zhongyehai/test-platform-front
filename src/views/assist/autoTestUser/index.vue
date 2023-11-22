<template>
  <div class="app-container">

    <el-form label-width="120px">
      <el-form-item :label="'选择环境：'" size="mini">
        <el-select
          v-model="currentEnv"
          placeholder="请选择环境"
          size="mini"
          filterable
          default-first-option
        >
          <el-option
            v-for="(env) in envList"
            :key="env.code"
            :label="env.name"
            :value="env.code"
          />
        </el-select>

      </el-form-item>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      size="mini"
      :data="currentDataList"
      stripe
      style="width: 100%"
      @cell-dblclick="cellDblclick"
    >
      <el-table-column show-overflow-tooltip label="数据id" align="center" prop="id" min-width="8%">
        <template slot-scope="scope">
          <span> {{ scope.row.id }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="手机号/账号" align="center" prop="mobile" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.mobile }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="密码" align="center" prop="password" min-width="22%">
        <template slot-scope="scope">
          <span> {{ scope.row.password }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="access_token" align="center" prop="access_token" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.access_token }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="refresh_token" align="center" prop="refresh_token" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.refresh_token }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="公司名称" align="center" prop="company_name" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.company_name }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="角色" align="center" prop="role" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.role }} </span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="所属环境" align="center" prop="env" min-width="10%">
        <template slot-scope="scope">
          <span> {{ envDict[scope.row.env] }} </span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="page_num"
      :limit.sync="page_size"
      @pagination="getAutoTestUserData"
    />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

import { getAutoTestUser } from '@/apis/assist/dataPool'
import { runEnvList } from '@/apis/config/runEnv' // 初始化超时时间

export default {
  name: 'DataPool',
  components: { Pagination },
  data() {
    return {
      listLoading: false, // 加载状态
      total: 0,
      page_num: 1,
      page_size: 20,
      currentDataList: [], // 数据列表
      currentEnv: '', // 选择的环境
      envList: [],
      envDict: {} // 环境字典
    }
  },

  watch: {
    'currentEnv': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.getAutoTestUserData()
        }
      }
    }
  },

  mounted() {
    // 获取环境配置
    runEnvList().then(response => {
      if (response.data.data.length > 0) {
        this.currentEnv = response.data.data[0].code
      }

      response.data.data.forEach(env => {
        if (!(env.code in this.envDict)) {
          this.envList.push(env)
        }
        this.envDict[env.code] = env.name
      })
    })
  },

  methods: {

    // 获取数据池数据
    getAutoTestUserData() {
      getAutoTestUser({ env: this.currentEnv, page_num: this.page_num, page_size: this.page_size, }).then(response => {
        this.currentDataList = response.data.data
        this.total = response.data.total
      })
    },

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      this.$copyText(typeof (data) === 'string' ? data : JSON.stringify(data)).then(
        function(e) {
          that.$message.success('复制成功')
        }
      )
    }

  }

}
</script>

<style>

</style>
