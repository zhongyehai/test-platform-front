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
      :data="currentDataList"
      stripe
      style="width: 100%"
    >
      <el-table-column :show-overflow-tooltip="true" label="数据id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span> {{ scope.row.id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="手机号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.mobile }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="密码" align="center" min-width="22%">
        <template slot-scope="scope">
          <span> {{ scope.row.password }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="access_token" align="center" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.access_token }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="refresh_token" align="center" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.refresh_token }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="公司名称" align="center" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.company_name }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="角色" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.role }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="所属环境" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ envDict[scope.row.env] }} </span>
        </template>
      </el-table-column>
    </el-table>

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
      getAutoTestUser({ 'env': this.currentEnv }).then(response => {
        this.currentDataList = response.data
      })
    }

  }

}
</script>

<style>

</style>
